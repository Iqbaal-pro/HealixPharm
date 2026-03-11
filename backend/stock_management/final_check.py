"""
Final Live Check: Connect to Railway and count rows in all 24 tables.
"""
import mysql.connector

try:
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
    
    print(f"\nCONNECTED TO RAILWAY DB")
    print(f"{'Table':<30} {'Rows':<10}")
    print("-" * 40)
    
    for table in sorted(tables):
        cursor.execute(f"SELECT COUNT(*) FROM `{table}`")
        count = cursor.fetchone()[0]
        print(f"{table:<30} {count:<10}")
    
    conn.close()
    print("\nALL CONNECTIONS VERIFIED LIVE!")
except Exception as e:
    print(f"FAILED TO CONNECT: {e}")
