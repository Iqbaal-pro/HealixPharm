"""
Full comparison: Railway DB vs ALL code models.
Checks every table and column, reports mismatches.
"""
import mysql.connector
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

conn = mysql.connector.connect(
    host="ballast.proxy.rlwy.net",
    port=33283,
    user="root",
    password="RlnRjwychOZnxtmmsQijKtvjmuadwelv",
    database="railway",
)
cursor = conn.cursor()

cursor.execute("SHOW TABLES")
db_tables = {t[0] for t in cursor.fetchall()}

db_schema = {}
for table in db_tables:
    cursor.execute(f"DESCRIBE `{table}`")
    cols = cursor.fetchall()
    db_schema[table] = {}
    for c in cols:
        db_schema[table][c[0]] = {"type": c[1], "null": c[2], "key": c[3], "default": c[4]}

conn.close()

stock_models = {
    "medicines": ["id", "name", "sku", "dosage_form", "strength", "unit_of_measurement",
                  "category", "manufacturer", "registration_number", "cost_price",
                  "selling_price", "minimum_stock_threshold", "maximum_stock_level",
                  "created_at", "is_active"],
    "inventory": ["id", "medicine_id", "batch_id", "quantity_available", "quantity_reserved",
                  "quantity_damaged", "quantity_expired", "reorder_level", "reorder_quantity",
                  "turnover_rate", "last_stock_update", "last_dispensed_at"],
    "medicine_batches": ["id", "medicine_id", "batch_number", "supplier_id",
                        "manufacture_date", "expiry_date", "cost_price",
                        "received_date", "created_at", "is_active", "is_expired"],
    "patients": ["id", "name", "phone_number", "language", "consent", "created_at"],
    "prescriptions": ["id", "patient_id", "uploaded_by_staff_id", "medicine_name",
                     "dose_per_day", "start_date", "quantity_given", "is_continuous", "created_at"],
    "issued_items": ["id", "prescription_id", "medicine_id", "batch_id",
                    "quantity_issued", "issued_at", "issued_by"],
    "reminders": ["id", "prescription_id", "reminder_time", "channel", "status",
                 "one_time", "created_at"],
    "reminder_logs": ["id", "reminder_id", "attempt_time", "channel", "result", "error_message"],
    "stock_adjustments": ["id", "medicine_id", "batch_id", "adjustment_quantity",
                         "adjustment_type", "reason", "cost_impact", "staff_id",
                         "approved_by", "approved_at", "created_at"],
    "stock_alerts": ["id", "medicine_id", "batch_id", "alert_type", "current_quantity",
                    "threshold_value", "is_active", "is_acknowledged", "acknowledged_by",
                    "acknowledged_at", "created_at", "resolved_at"],
    "stock_logs": ["id", "medicine_id", "batch_id", "quantity_used", "reason",
                  "issued_to", "reference_type", "logged_at", "staff_id"],
    "stock_updates": ["id", "medicine_id", "batch_id", "batch_number", "manufacture_date",
                     "expiry_date", "quantity_added", "cost_price", "total_cost",
                     "supplier_name", "supplier_id", "staff_id", "date_received", "updated_at"],
    "users": ["id", "username", "email", "password", "created_at"],
    "pharmacies": ["id", "user_id", "pharmacy_name", "contact_number", "whatsapp_number",
                  "address", "opening_hours", "estimated_delivery_time", "service_areas",
                  "service_charge", "prescription_policy", "refund_policy", "created_at"],
}

healix_models = {
    "orders": ["id", "token", "status", "user_id", "total_amount", "payment_method",
              "payment_provider", "payment_status", "payment_reference", "paid_amount",
              "paid_at", "approved_at", "cancelled_at", "reminder_count", "created_at"],
    "order_items": ["id", "order_id", "medicine_id", "medicine_name", "quantity",
                   "unit_price", "subtotal"],
    "payments": ["id", "order_id", "provider", "status", "reference", "amount",
                "ipn_payload", "created_at"],
    "support_tickets": ["id", "user_id", "agent_id", "status", "created_at", "accepted_at"],
    "support_messages": ["id", "ticket_id", "sender_type", "body", "created_at"],
    "moh_disease_alerts": ["id", "disease_name", "region", "threat_level", "start_date",
                          "end_date", "status", "broadcast_sent", "retry_count",
                          "last_attempt_at", "created_at", "updated_at"],
    "alert_broadcast_log": ["id", "alert_id", "phone_number", "send_status",
                           "api_response", "created_at"],
    "pharmacy_settings": ["id", "key", "value"],
    "delivery_settings": ["id", "area", "charge", "estimated_time"],
    "policy_settings": ["id", "policy_type", "content"],
}

all_expected = {}
all_expected.update(stock_models)
all_expected.update(healix_models)

print(f"\n{'='*70}")
print(f"RAILWAY DB VERIFICATION REPORT")
print(f"Tables in DB: {len(db_tables)}")
print(f"Tables expected by code: {len(all_expected)}")
print(f"{'='*70}")

missing_tables = []
extra_tables = []
mismatched_tables = []
ok_tables = []

for table, expected_cols in sorted(all_expected.items()):
    if table not in db_schema:
        missing_tables.append((table, expected_cols))
        continue
    db_cols = set(db_schema[table].keys())
    expected_set = set(expected_cols)
    missing_cols = expected_set - db_cols
    extra_cols = db_cols - expected_set
    if missing_cols:
        mismatched_tables.append((table, sorted(missing_cols), sorted(extra_cols)))
    elif extra_cols:
        ok_tables.append((table, f"OK (+{len(extra_cols)} extra: {sorted(extra_cols)})"))
    else:
        ok_tables.append((table, "PERFECT MATCH"))

for table in sorted(db_tables):
    if table not in all_expected:
        extra_tables.append(table)

print(f"\n[OK] MATCHING TABLES ({len(ok_tables)}):")
for table, status in ok_tables:
    print(f"   {table:<30} {status}")

if mismatched_tables:
    print(f"\n[WARN] TABLES WITH MISSING COLUMNS ({len(mismatched_tables)}):")
    for table, missing, extra in mismatched_tables:
        print(f"   {table}:")
        print(f"      Missing from DB: {missing}")
        if extra:
            print(f"      Extra in DB:     {extra}")

if missing_tables:
    print(f"\n[FAIL] TABLES MISSING FROM DB ({len(missing_tables)}):")
    for table, cols in missing_tables:
        print(f"   {table} ({len(cols)} columns needed)")

if extra_tables:
    print(f"\n[INFO] EXTRA TABLES IN DB (not in code, OK to keep):")
    for table in extra_tables:
        print(f"   {table} ({len(db_schema[table])} cols)")

print(f"\n{'='*70}")
if not missing_tables and not mismatched_tables:
    print("ALL TABLES MATCH CODE MODELS!")
else:
    print(f"{len(missing_tables)} missing + {len(mismatched_tables)} mismatched = {len(missing_tables)+len(mismatched_tables)} issue(s)")
print(f"{'='*70}")
