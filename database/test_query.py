# test_query.py
from dbconnection import get_db
import mysql.connector

def main():
    try:
        db = get_db()
        print("Connected OK")

        cur = db.cursor()

        # basic sanity checks
        cur.execute("SELECT DATABASE()")
        print("Database:", cur.fetchone()[0])

        # list tables in frauddb
        cur.execute("SHOW TABLES")
        tables = [r[0] for r in cur.fetchall()]
        print("Tables:", tables)

        # counts and fraud rates if tables exist
        for tbl in ["geo_test", "tx_test"]:
            if tbl in tables:
                cur.execute(f"SELECT COUNT(*), AVG(label_isFraud) FROM {tbl}")
                total, rate = cur.fetchone()
                print(f"{tbl} rows {total}, fraud rate {rate}")

                # peek 3 rows
                cur.execute(f"SELECT * FROM {tbl} LIMIT 3")
                rows = cur.fetchall()
                cols = [d[0] for d in cur.description]
                print(f"Sample rows from {tbl}:")
                for r in rows:
                    print(dict(zip(cols, r)))
            else:
                print(f"{tbl} not found")

        cur.close()
        db.close()
        print("Closed connection")

    except mysql.connector.Error as e:
        print("MySQL error:", e)
    except Exception as e:
        print("General error:", e)

if __name__ == "__main__":
    main()