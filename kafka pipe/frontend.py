# 1) eventlet monkey-patch (before creating SocketIO)
import eventlet
eventlet.monkey_patch()

import json, collections
from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO
from confluent_kafka import Consumer
from config import *

app = Flask(__name__)
socketio = SocketIO(
    app,
    async_mode="eventlet",
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25
)

# Buffers to preload the page
BUF = {
    "transactions": collections.deque(maxlen=200),      # scored txns
    "behaviours": collections.deque(maxlen=200),        # scored behs
    "transactions_raw": collections.deque(maxlen=200),  # raw txns
    "behaviours_raw": collections.deque(maxlen=200),    # raw behs
    "flagged": collections.deque(maxlen=200),           # only flagged scored
}


def consume_and_emit(topic, buf_key, event_name, group_id,
                     flag_check=False, source=None):
    app.logger.info(f"[frontend] starting consumer for {topic} (group {group_id})")
    consumer = Consumer({
        "bootstrap.servers": BOOTSTRAP_SERVERS,
        "group.id": group_id,
        "auto.offset.reset": "latest"
    })
    consumer.subscribe([topic])

    try:
        while True:
            msg = consumer.poll(0.2)
            if msg is None:
                socketio.sleep(0)
                continue
            if msg.error():
                app.logger.warning(f"[frontend] Consumer error on {topic}: {msg.error()}")
                continue

            val = json.loads(msg.value().decode("utf-8"))
            BUF[buf_key].appendleft(val)
            socketio.emit(event_name, val)

            # If flagged and from a scored topic, push to flagged buffer
            if flag_check and val.get("decision") == "flag":
                flagged_row = {**val, "source": source}
                BUF["flagged"].appendleft(flagged_row)
                socketio.emit("flag_event", flagged_row)

            socketio.sleep(0)
    finally:
        consumer.close()


def start_consumers():
    # Raw streams
    socketio.start_background_task(
        consume_and_emit,
        TOPIC_TXN_RAW, "transactions_raw", "txn_raw", "frontend-txn-raw"
    )
    socketio.start_background_task(
        consume_and_emit,
        TOPIC_BEH_RAW, "behaviours_raw", "beh_raw", "frontend-beh-raw"
    )

    # Scored streams
    socketio.start_background_task(
        consume_and_emit,
        TOPIC_TXN_SCORED, "transactions", "txn_event", "frontend-txn",
        True, "transaction"
    )
    socketio.start_background_task(
        consume_and_emit,
        TOPIC_BEH_SCORED, "behaviours", "beh_event", "frontend-beh",
        True, "behaviour"
    )


@app.route("/")
def index():
    return render_template(
        "index.html",
        initial_txns=list(BUF["transactions"]),
        initial_behs=list(BUF["behaviours"]),
        initial_txns_raw=list(BUF["transactions_raw"]),
        initial_behs_raw=list(BUF["behaviours_raw"]),
        initial_flags=list(BUF["flagged"])
    )


@app.get("/snapshot")
def snapshot():
    return jsonify({
        "transactions": list(BUF["transactions"]),
        "behaviours": list(BUF["behaviours"]),
        "transactions_raw": list(BUF["transactions_raw"]),
        "behaviours_raw": list(BUF["behaviours_raw"]),
        "flagged": list(BUF["flagged"])
    })


if __name__ == "__main__":
    start_consumers()
    socketio.run(app, host="0.0.0.0", port=8000, debug=False)