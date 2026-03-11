"""Inspect the healixpharm database."""
import mysql.connector
import sys

try:
    conn = mysql.connector.connect(
        host="127.0.0.1",
        port=3306,
        user="stock_user",
        password="stock123",
        database="stock_management_db",
    )
except mysql.connector.errors.ProgrammingError as e:
    if "1049" in str(e):
        print(f"ERROR: Database 'healixpharm' does not exist.")
        print("Trying to list all databases...")
        conn = mysql.connector.connect(
            host="127.0.0.1", port=3306,
            user="root", password="Angel@0602!",
        )
        cursor = conn.cursor()
        cursor.execute("SHOW DATABASES")
        print("Available databases:")
        for d in cursor.fetchall():
            print(f"  - {d[0]}")
        conn.close()
    else:
        print(f"ERROR: {e}")
    sys.exit(1)
except mysql.connector.errors.InterfaceError as e:
    print(f"CONNECTION ERROR: {e}")
    sys.exit(1)
except Exception as e:
    print(f"ERROR ({type(e).__name__}): {e}")
    # Try without password
    try:
        conn = mysql.connector.connect(
            host="127.0.0.1", port=3306,
            user="root", password="",
        )
        cursor = conn.cursor()
        cursor.execute("SHOW DATABASES")
        print("\nConnected as root (no password). Available databases:")
        for d in cursor.fetchall():
            print(f"  - {d[0]}")
        conn.close()
    except:
        pass
    sys.exit(1)

cursor = conn.cursor()
cursor.execute("SHOW TABLES")
tables = [t[0] for t in cursor.fetchall()]
print(f"\nDATABASE: healixpharm")
print(f"TABLES FOUND: {len(tables)}")
print("=" * 60)

for table in tables:
    cursor.execute(f"DESCRIBE `{table}`")
    cols = cursor.fetchall()
    print(f"\n--- {table} ({len(cols)} columns) ---")
    print(f"  {'Column':<30} {'Type':<25} {'Key':<5} {'Null':<10} {'Default'}")
    print(f"  {'-'*30} {'-'*25} {'-'*5} {'-'*10} {'-'*15}")
    for c in cols:
        key = "PK" if c[3] == "PRI" else "FK" if c[3] == "MUL" else "UNI" if c[3] == "UNI" else ""
        null = "NOT NULL" if c[2] == "NO" else "nullable"
        default = str(c[4]) if c[4] is not None else ""
        print(f"  {c[0]:<30} {c[1]:<25} {key:<5} {null:<10} {default}")

conn.close()
print(f"\n{'='*60}")
print("Done!")
