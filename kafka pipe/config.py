BOOTSTRAP_SERVERS = "localhost:9092"

TOPIC_TXN_RAW    = "transactions.raw"
TOPIC_BEH_RAW    = "behaviours.raw"
TOPIC_TXN_SCORED = "transactions.scored"
TOPIC_BEH_SCORED = "behaviours.scored"

# Local CSVs in the same folder as your .py files
TXN_CSV_PATH = "./tx_linked_with_entity.csv"
BEH_CSV_PATH = "./geo_linked_with_entity.csv"

# pacing: one txn + one beh per tick
REPLAY_INTERVAL = 0.5

# origin for synthesizing tx event_time from tx_day_int (+ step)
TXN_ORIGIN_ISO = "2022-01-01T00:00:00Z"