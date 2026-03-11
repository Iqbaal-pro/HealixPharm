"""Inspect the Railway DB and compare against expected models."""
import mysql.connector

conn = mysql.connector.connect(
    host="ballast.proxy.rlwy.net",
    port=33283,
    user="root",
    password="RlnRjwychOZnxtmmsQijKtvjmuadwelv",
    database="railway",
)
cursor = conn.cursor()

cursor.execute("SHOW TABLES")
tables = [t[0] for t in cursor.fetchall()]
print(f"\nDATABASE: railway (Railway)")
print(f"TABLES FOUND: {len(tables)}")
print("=" * 70)

for table in tables:
    cursor.execute(f"DESCRIBE `{table}`")
    cols = cursor.fetchall()
    print(f"\n--- {table} ({len(cols)} columns) ---")
    print(f"  {'Column':<30} {'Type':<30} {'Key':<5} {'Null':<10} {'Default'}")
    print(f"  {'-'*30} {'-'*30} {'-'*5} {'-'*10} {'-'*15}")
    for c in cols:
        key = "PK" if c[3] == "PRI" else "FK" if c[3] == "MUL" else "UNI" if c[3] == "UNI" else ""
        null = "NOT NULL" if c[2] == "NO" else "nullable"
        default = str(c[4]) if c[4] is not None else ""
        print(f"  {c[0]:<30} {c[1]:<30} {key:<5} {null:<10} {default}")

conn.close()
print(f"\n{'='*70}")
print("Done!")
