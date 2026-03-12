import hashlib
import sqlite3
import requests
import os
import sys
from dotenv import load_dotenv

# Load env from healix_app/.env
env_path = os.path.join("healix_app", ".env")
load_dotenv(env_path)

MERCHANT_ID = os.getenv("PAYHERE_MERCHANT_ID", "12345")
MERCHANT_SECRET = os.getenv("PAYHERE_MERCHANT_SECRET", "secret123")
CURRENCY = os.getenv("PAYHERE_CURRENCY", "LKR")

DB_PATH = os.path.join("healix_app", "healix.db")
BASE_URL = "http://localhost:8000"

def simulate():
    print("--- HealixPharm Payment Simulation ---")
    
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    # 1. Create/Find a test order
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Try to find an existing user or create one
    cursor.execute("SELECT id, phone FROM users LIMIT 1")
    user = cursor.fetchone()
    if not user:
        cursor.execute("INSERT INTO users (phone, name) VALUES ('+94770000000', 'Simulation User')")
        conn.commit()
        user_id = cursor.lastrowid
        user_phone = "+94770000000"
    else:
        user_id, user_phone = user

    # Create a fresh order for simulation
    import uuid
    token = f"SIM_{uuid.uuid4().hex[:8].upper()}"
    amount = 1250.00
    
    # Ensure columns exist (running migrations via models usually does this but we'll be safe)
    try:
        cursor.execute("""
            INSERT INTO orders (token, status, user_id, total_amount, payment_status, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (token, "AWAITING_PAYMENT", user_id, amount, "PENDING", "2024-01-01 10:00:00"))
        conn.commit()
    except sqlite3.OperationalError as e:
        print(f"DB Error: {e}. Attempting to fix schema...")
        # Simple fix: Recreate table if problematic, but let's try to just add the column if missing
        if "no such column: total_amount" in str(e):
             cursor.execute("ALTER TABLE orders ADD COLUMN total_amount FLOAT")
             cursor.execute("ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'PENDING'")
             cursor.execute("ALTER TABLE orders ADD COLUMN payment_reference VARCHAR(255)")
             cursor.execute("ALTER TABLE orders ADD COLUMN paid_amount FLOAT")
             conn.commit()
             # Retry insert
             cursor.execute("""
                INSERT INTO orders (token, status, user_id, total_amount, payment_status, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (token, "AWAITING_PAYMENT", user_id, amount, "PENDING", "2024-01-01 10:00:00"))
             conn.commit()
    
    print(f"Created Test Order: {token} | Amount: {amount}")

    # 2. Generate Signature
    # md5sig = UpperCase(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + UpperCase(md5(merchant_secret))))
    secret_hash = hashlib.md5(MERCHANT_SECRET.encode()).hexdigest().upper()
    payhere_amount = "{:.2f}".format(amount)
    status_code = "2" # Success
    
    check_string = MERCHANT_ID + token + payhere_amount + CURRENCY + status_code + secret_hash
    md5sig = hashlib.md5(check_string.encode()).hexdigest().upper()

    # 3. Send IPN
    payload = {
        "merchant_id": MERCHANT_ID,
        "order_id": token,
        "payhere_amount": payhere_amount,
        "payhere_currency": CURRENCY,
        "status_code": status_code,
        "md5sig": md5sig,
        "payment_id": f"PAY_SIM_{uuid.uuid4().hex[:6].upper()}"
    }

    print(f"Sending IPN to {BASE_URL}/payments/payhere/notify...")
    try:
        response = requests.post(f"{BASE_URL}/payments/payhere/notify", data=payload)
        if response.status_code == 200:
            print("Response: 200 OK")
            print("Payload accepted by server.")
        else:
            print(f"Response: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Connection Failed: {e}. Is the server running on port 8000?")
        return

    # 4. Verify DB updated
    cursor.execute("SELECT status, payment_status FROM orders WHERE token = ?", (token,))
    row = cursor.fetchone()
    if row and row[0] == "PAID":
        print(f"Verification: Order {token} is now PAID! ✅")
    else:
        print(f"Verification: Order {token} status is {row[0] if row else 'NOT FOUND'}. ❌")

    conn.close()

if __name__ == "__main__":
    simulate()
