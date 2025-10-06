import argparse
import csv
import json
import os
import sys
import time
from contextlib import closing
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, Iterator, Optional

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

from confluent_kafka import Producer
from config import *
from database.dbconnection import get_db

KNOWN_TYPES = {"CASH_IN", "CASH_OUT", "TRANSFER", "PAYMENT", "DEBIT"}


def mk_producer() -> Producer:
    return Producer({"bootstrap.servers": BOOTSTRAP_SERVERS})


def parse_int(val, default: int = 0) -> int:
    try:
        if val in (None, ""):
            return default
        return int(float(val))
    except Exception:
        return default


def parse_float(val, default: float = 0.0) -> float:
    try:
        if val in (None, ""):
            return default
        return float(val)
    except Exception:
        return default


def to_iso_utc(dt: datetime) -> str:
    return (dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)).astimezone(timezone.utc).isoformat()


def txn_time_from_day_step(origin_dt: datetime, tx_day_int, step) -> str:
    day = parse_int(tx_day_int, 0)
    stp = parse_int(step, 0)
    dt = origin_dt + timedelta(days=day, minutes=stp % 1440)
    return to_iso_utc(dt)


def resolve_event_time(value: Optional[str], origin_dt: datetime, tx_day_int, step) -> str:
    candidate = (value or "").strip()
    if candidate:
        for fmt in (
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M",
            "%Y-%m-%dT%H:%M",
            "%H:%M:%S",
            "%H:%M",
        ):
            try:
                dt = datetime.strptime(candidate, fmt)
            except ValueError:
                continue
            if fmt.startswith("%H"):
                dt = datetime.combine(origin_dt.date(), dt.time())
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return to_iso_utc(dt)
    return txn_time_from_day_step(origin_dt, tx_day_int, step)


def resolve_beh_event_time(value: Optional[str], origin_dt: datetime) -> str:
    candidate = (value or "").strip()
    if candidate:
        for fmt in (
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M",
            "%Y-%m-%dT%H:%M",
            "%H:%M:%S",
            "%H:%M",
        ):
            try:
                dt = datetime.strptime(candidate, fmt)
            except ValueError:
                continue
            if fmt.startswith("%H"):
                dt = datetime.combine(origin_dt.date(), dt.time())
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return to_iso_utc(dt)
    return to_iso_utc(datetime.now(timezone.utc))


def normalise_tx_row(row: Dict) -> Dict:
    row = dict(row)
    if row.get("newbalanceOrg") is None and row.get("newbalanceOrig") is not None:
        row["newbalanceOrg"] = row.get("newbalanceOrig")

    if row.get("tx_day_int") is None and row.get("step") is not None:
        try:
            row["tx_day_int"] = int(parse_int(row.get("step")) // 1440)
        except Exception:
            row["tx_day_int"] = 0

    raw_tx_type = row.get("tx_nameOrig")
    tx_type_hint: Optional[str] = None
    if isinstance(raw_tx_type, str):
        candidate = raw_tx_type.strip().upper()
        if candidate in KNOWN_TYPES:
            tx_type_hint = raw_tx_type.strip()

    fallback_type = row.get("type")
    if tx_type_hint is None and isinstance(fallback_type, str):
        candidate = fallback_type.strip().upper()
        if candidate in KNOWN_TYPES:
            tx_type_hint = fallback_type.strip()

    amount_val = parse_float(row.get("amount"))
    if (amount_val == 0 or amount_val is None) and isinstance(fallback_type, str):
        amount_val = parse_float(fallback_type)
    if amount_val in (None, 0.0):
        before = parse_float(row.get("oldbalanceOrg"))
        after = parse_float(row.get("newbalanceOrg"))
        delta = before - after
        if abs(delta) > 0:
            amount_val = abs(delta)

    src_account = row.get("nameOrig") or f"ID{row.get('link_id')}"

    row["__tx_type__"] = tx_type_hint or ""
    row["__tx_amount__"] = amount_val
    row["__src_account__"] = src_account
    return row


def txn_event(row: Dict, origin_dt: datetime) -> Dict:
    row = normalise_tx_row(row)
    link_id = str(row.get("link_id", "")).strip()
    tx_type = row.get("__tx_type__") or row.get("tx_type") or row.get("type") or ""
    amount = parse_float(row.get("__tx_amount__", row.get("amount")))
    src_account = row.get("__src_account__") or row.get("src_account") or (f"ID{link_id}" if link_id else "")
    event_time = resolve_event_time(row.get("event_time"), origin_dt, row.get("tx_day_int"), row.get("step"))

    return {
        "kind": "transaction_raw",
        "event_time": event_time,
        "link_id": link_id,
        "entity_id": parse_int(row.get("entity_id")),
        "tx_type": tx_type,
        "amount": amount,
        "src_account": src_account,
        "dst_account": row.get("nameDest", "") or "",
        "src_balance_before": parse_float(row.get("oldbalanceOrg")),
        "src_balance_after": parse_float(row.get("newbalanceOrg")),
        "dst_balance_before": parse_float(row.get("oldbalanceDest")),
        "dst_balance_after": parse_float(row.get("newbalanceDest")),
        "tx_step": parse_int(row.get("step")),
        "tx_day": parse_int(row.get("tx_day_int")),
    }


def beh_event(row: Dict, origin_dt: datetime) -> Dict:
    link_id = str(row.get("link_id", "")).strip()
    return {
        "kind": "behaviour_raw",
        "event_time": resolve_beh_event_time(row.get("event_time"), origin_dt),
        "link_id": link_id,
        "entity_id": parse_int(row.get("entity_id")),
        "client_hash": row.get("client_id", "") or "",
        "latitude": parse_float(row.get("latitude")),
        "longitude": parse_float(row.get("longitude")),
        "suspicion_score": (None if (row.get("composite_suspicion_score") in (None, "", "NaN"))
                            else parse_float(row.get("composite_suspicion_score"))),
        "geo_band": row.get("geo_band", "") or "",
        "geo_day": parse_int(row.get("geo_day_int")),
    }


def csv_row_iter(path: str) -> Iterator[Dict]:
    while True:
        with open(path, newline="", encoding="utf-8") as handle:
            reader = csv.DictReader(handle)
            emitted = False
            for row in reader:
                emitted = True
                yield row
        if not emitted:
            time.sleep(1.0)
        time.sleep(0.05)


def db_txn_iter(table: str) -> Iterator[Dict]:
    query = f"SELECT * FROM {table} ORDER BY event_time ASC, step ASC, link_id ASC"
    while True:
        conn = None
        try:
            conn = get_db()
            with closing(conn.cursor(dictionary=True, buffered=False)) as cur:
                cur.execute(query)
                emitted = False
                for row in cur:
                    emitted = True
                    yield row
                if not emitted:
                    time.sleep(1.0)
        except Exception as exc:
            print(f"[producer] database iterator error: {exc}", file=sys.stderr, flush=True)
            time.sleep(5.0)
        finally:
            if conn is not None:
                try:
                    conn.close()
                except Exception:
                    pass
        time.sleep(0.1)


def db_beh_iter(table: str) -> Iterator[Dict]:
    query = f"SELECT * FROM {table} ORDER BY event_time ASC, link_id ASC"
    while True:
        conn = None
        try:
            conn = get_db()
            with closing(conn.cursor(dictionary=True, buffered=False)) as cur:
                cur.execute(query)
                emitted = False
                for row in cur:
                    emitted = True
                    yield row
                if not emitted:
                    time.sleep(1.0)
        except Exception as exc:
            print(f"[producer] database iterator error: {exc}", file=sys.stderr, flush=True)
            time.sleep(5.0)
        finally:
            if conn is not None:
                try:
                    conn.close()
                except Exception:
                    pass
        time.sleep(0.1)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--txn-csv", default=TXN_CSV_PATH)
    parser.add_argument("--beh-csv", default=BEH_CSV_PATH)
    parser.add_argument("--interval", type=float, default=REPLAY_INTERVAL)
    parser.add_argument("--origin", default=TXN_ORIGIN_ISO)
    parser.add_argument("--txn-source", choices=["db", "csv"], default=os.getenv("TXN_SOURCE", "db"))
    parser.add_argument(
        "--txn-table",
        default=os.getenv("TXN_DB_TABLE", "tx_test"),
        help="Database table to read transactions from when txn-source=db",
    )
    parser.add_argument(
        "--beh-source", choices=["db", "csv"], default=os.getenv("BEH_SOURCE", "db"),
        help="Data source for behaviour stream",
    )
    parser.add_argument(
        "--beh-table",
        default=os.getenv("BEH_DB_TABLE", "geo_test"),
        help="Database table to read behaviours from when beh-source=db",
    )
    args = parser.parse_args()

    origin_dt = datetime.fromisoformat(args.origin.replace("Z", "+00:00"))
    producer = mk_producer()

    txn_iter = csv_row_iter(args.txn_csv) if args.txn_source == "csv" else db_txn_iter(args.txn_table)
    beh_iter = csv_row_iter(args.beh_csv) if args.beh_source == "csv" else db_beh_iter(args.beh_table)

    if args.txn_source == "csv":
        print(f"Transaction source: CSV ({args.txn_csv})")
    else:
        print(f"Transaction source: database table {args.txn_table}")
    if args.beh_source == "csv":
        print(f"Behaviour source: CSV ({args.beh_csv})")
    else:
        print(f"Behaviour source: database table {args.beh_table}")
    print("Replay producer started. Ctrl+C to stop.")

    try:
        while True:
            try:
                txn_row = next(txn_iter)
                tx_payload = txn_event(txn_row, origin_dt)
                producer.produce(
                    TOPIC_TXN_RAW,
                    key=(tx_payload.get("link_id", "") or "").encode(),
                    value=json.dumps(tx_payload).encode(),
                )
                producer.poll(0)
            except StopIteration:
                txn_iter = csv_row_iter(args.txn_csv) if args.txn_source == "csv" else db_txn_iter(args.txn_table)

            try:
                beh_row = next(beh_iter)
                beh_payload = beh_event(beh_row, origin_dt)
                producer.produce(
                    TOPIC_BEH_RAW,
                    key=(beh_payload.get("link_id", "") or "").encode(),
                    value=json.dumps(beh_payload).encode(),
                )
                producer.poll(0)
            except StopIteration:
                beh_iter = csv_row_iter(args.beh_csv) if args.beh_source == "csv" else db_beh_iter(args.beh_table)

            producer.flush(0)
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        producer.flush()


if __name__ == "__main__":
    main()
