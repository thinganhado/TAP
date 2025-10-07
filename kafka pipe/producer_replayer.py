import csv, time, argparse, json
from datetime import datetime, timedelta, timezone
from confluent_kafka import Producer
from config import *

def mk_producer():
    return Producer({"bootstrap.servers": BOOTSTRAP_SERVERS})

def parse_int(x, default=0):
    try: return int(float(x))
    except: return default

def parse_float(x, default=0.0):
    try: return float(x)
    except: return default

def to_iso_utc(dt: datetime) -> str:
    return (dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)).astimezone(timezone.utc).isoformat()

def txn_time_from_day_step(origin_dt: datetime, tx_day_int, step):
    day = parse_int(tx_day_int, 0)
    stp = parse_int(step, 0)
    dt = origin_dt + timedelta(days=day, minutes=stp % 1440)
    return to_iso_utc(dt)

def try_parse_beh_time(s: str) -> str:
    s = (s or "").strip()
    for fmt in ("%m/%d/%Y %H:%M", "%m/%d/%Y %H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S"):
        try:
            return to_iso_utc(datetime.strptime(s, fmt).replace(tzinfo=timezone.utc))
        except: pass
    return to_iso_utc(datetime.utcnow())

def txn_event(row, origin_dt):
    link_id = str(row.get("link_id", "")).strip()
    return {
        "kind": "transaction_raw",
        "event_time": txn_time_from_day_step(origin_dt, row.get("tx_day_int"), row.get("step")),
        "link_id": link_id,
        "entity_id": parse_int(row.get("entity_id")),
        "tx_type": row.get("type", "") or "",
        "amount": parse_float(row.get("amount")),
        "src_account": row.get("nameOrig", "") or "",
        "dst_account": row.get("nameDest", "") or "",
        "src_balance_before": parse_float(row.get("oldbalanceOrg")),
        "src_balance_after": parse_float(row.get("newbalanceOrg")),
        "dst_balance_before": parse_float(row.get("oldbalanceDest")),
        "dst_balance_after": parse_float(row.get("newbalanceDest")),
        "tx_step": parse_int(row.get("step")),
        "tx_day": parse_int(row.get("tx_day_int")),
    }, link_id

def beh_event(row):
    link_id = str(row.get("link_id", "")).strip()
    return {
        "kind": "behaviour_raw",
        "event_time": try_parse_beh_time(row.get("event_time")),
        "link_id": link_id,
        "entity_id": parse_int(row.get("entity_id")),
        "client_hash": row.get("client_id", "") or "",
        "latitude": parse_float(row.get("latitude")),
        "longitude": parse_float(row.get("longitude")),
        "suspicion_score": (None if (row.get("composite_suspicion_score") in (None, "", "NaN"))
                            else parse_float(row.get("composite_suspicion_score"))),
        "geo_band": row.get("geo_band", "") or "",
        "geo_day": parse_int(row.get("geo_day_int")),
    }, link_id

def row_iter(path):
    with open(path, newline="", encoding="utf-8") as f:
        rdr = csv.DictReader(f)
        for row in rdr:
            yield row

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--txn-csv", default=TXN_CSV_PATH)
    ap.add_argument("--beh-csv", default=BEH_CSV_PATH)
    ap.add_argument("--interval", type=float, default=REPLAY_INTERVAL)
    ap.add_argument("--origin", default=TXN_ORIGIN_ISO)
    args = ap.parse_args()

    origin_dt = datetime.fromisoformat(args.origin.replace("Z", "+00:00"))
    p = mk_producer()
    it_txn = row_iter(args.txn_csv)
    it_beh = row_iter(args.beh_csv)

    print("CSV Producer started. Ctrl+C to stop.")
    try:
        while True:
            # one txn
            try:
                r_txn = next(it_txn)
                txnev, key = txn_event(r_txn, origin_dt)
                p.produce(TOPIC_TXN_RAW, key=(key or "").encode(), value=json.dumps(txnev).encode())
                p.poll(0)
            except StopIteration:
                pass

            # one behaviour
            try:
                r_beh = next(it_beh)
                behev, keyb = beh_event(r_beh)
                p.produce(TOPIC_BEH_RAW, key=(keyb or "").encode(), value=json.dumps(behev).encode())
                p.poll(0)
            except StopIteration:
                pass

            p.flush(0)
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        p.flush()
