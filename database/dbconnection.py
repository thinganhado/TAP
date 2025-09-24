# dbconnection.py
import mysql.connector as mysql
from confluent_kafka import Producer  # pip install confluent-kafka

DB_CONFIG = {
    "host": "10.0.0.183",
    "user": "opc",
    "password": "tapDatabase2@",
    "database": "frauddb",
    "ssl_disabled": False,
}

def get_db():
    return mysql.connect(**DB_CONFIG)

# Kafka
def get_producer():
    return Producer({"bootstrap.servers": "localhost:9092"})