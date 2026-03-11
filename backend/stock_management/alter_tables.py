"""Run ALTER TABLE statements to add missing columns."""
import mysql.connector

conn = mysql.connector.connect(
    host="127.0.0.1",
    port=3306,
    user="stock_user",
    password="stock123",
    database="stock_management_db",
)
cursor = conn.cursor()

print("=== Adding columns to medicines table ===")
medicine_columns = [
    ("sku", "VARCHAR(50) UNIQUE AFTER name"),
    ("unit_of_measurement", "VARCHAR(20) NOT NULL DEFAULT 'tablet' AFTER strength"),
    ("category", "VARCHAR(100) AFTER unit_of_measurement"),
    ("manufacturer", "VARCHAR(100) AFTER category"),
    ("registration_number", "VARCHAR(50) AFTER manufacturer"),
    ("cost_price", "FLOAT NOT NULL DEFAULT 0 AFTER registration_number"),
    ("selling_price", "FLOAT NOT NULL DEFAULT 0 AFTER cost_price"),
    ("minimum_stock_threshold", "INT DEFAULT 10 AFTER selling_price"),
    ("maximum_stock_level", "INT AFTER minimum_stock_threshold"),
    ("is_active", "TINYINT(1) DEFAULT 1"),
]

for col_name, col_def in medicine_columns:
    try:
        cursor.execute(f"ALTER TABLE medicines ADD COLUMN {col_name} {col_def}")
        print(f"  ✅ Added {col_name}")
    except mysql.connector.errors.ProgrammingError as e:
        if "Duplicate column" in str(e):
            print(f"  ⏭️  {col_name} already exists")
        else:
            print(f"  ❌ {col_name}: {e}")

# Add created_at only if not exists (check first)
try:
    cursor.execute("SELECT created_at FROM medicines LIMIT 0")
    print("  ⏭️  created_at already exists")
except:
    try:
        cursor.execute("ALTER TABLE medicines ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP")
        print("  ✅ Added created_at")
    except Exception as e:
        print(f"  ❌ created_at: {e}")

conn.commit()

print("\n=== Adding columns to inventory table ===")
inventory_columns = [
    ("batch_id", "INT AFTER medicine_id"),
    ("quantity_reserved", "INT NOT NULL DEFAULT 0 AFTER quantity_available"),
    ("quantity_damaged", "INT NOT NULL DEFAULT 0 AFTER quantity_reserved"),
    ("quantity_expired", "INT NOT NULL DEFAULT 0 AFTER quantity_damaged"),
    ("reorder_quantity", "INT AFTER reorder_level"),
    ("turnover_rate", "FLOAT AFTER reorder_quantity"),
    ("last_stock_update", "DATETIME DEFAULT CURRENT_TIMESTAMP AFTER turnover_rate"),
    ("last_dispensed_at", "DATETIME AFTER last_stock_update"),
]

for col_name, col_def in inventory_columns:
    try:
        cursor.execute(f"ALTER TABLE inventory ADD COLUMN {col_name} {col_def}")
        print(f"  ✅ Added {col_name}")
    except mysql.connector.errors.ProgrammingError as e:
        if "Duplicate column" in str(e):
            print(f"  ⏭️  {col_name} already exists")
        else:
            print(f"  ❌ {col_name}: {e}")

conn.commit()
conn.close()
print("\n✅ All done!")
