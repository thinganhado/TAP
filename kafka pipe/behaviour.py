import json, random, threading
from flask import Flask
from confluent_kafka import Consumer, Producer
from config import *

app = Flask(__name__)
producer = Producer({"bootstrap.servers": BOOTSTRAP_SERVERS})

def consume_and_score():
    consumer = Consumer({
        "bootstrap.servers": BOOTSTRAP_SERVERS,
        "group.id": "beh-model",
        "auto.offset.reset": "latest"
    })
    consumer.subscribe([TOPIC_BEH_RAW])

    while True:
        msg = consumer.poll(0.5)
        if msg is None: continue
        if msg.error():
            app.logger.warning(f"[beh-model] {msg.error()}")
            continue

        ev = json.loads(msg.value().decode("utf-8"))
        link_id = ev.get("link_id")
        score = round(random.random(), 4)
        out = {
            "kind": "score",
            "stream": "behaviour",
            "event_time": ev.get("event_time"),
            "link_id": link_id,
            "features_version": "v1",
            "model_version": "random-1",
            "risk_score": score,
            "decision": "flag" if score >= 0.7 else "ok",
            "source": "beh-model",
            "context": {
                "latitude": ev.get("latitude"),
                "longitude": ev.get("longitude"),
                "geo_band": ev.get("geo_band")
            }
        }
        producer.produce(TOPIC_BEH_SCORED, key=(link_id or "").encode(), value=json.dumps(out).encode())
        producer.poll(0)

threading.Thread(target=consume_and_score, daemon=True).start()

@app.get("/health")
def health():
    return {"status": "ok", "service": "behaviour-model"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8020, debug=False)
