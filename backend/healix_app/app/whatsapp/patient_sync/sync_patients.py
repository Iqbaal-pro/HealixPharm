import os
import sys
import pandas as pd
import mysql.connector
import time
import json
from datetime import datetime
from dotenv import load_dotenv
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from app.utils.encryption import encrypt_data

# Add project root to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
load_dotenv()

# Google Sheets Settings
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_FILE = os.path.join(BASE_DIR, "service_account.json")
LAST_SYNC_FILE = os.path.join(BASE_DIR, "last_sync.json")
SPREADSHEET_ID = "12K70ehIvsFf8F6e5NFPwcCg_-lgH0QbU0ZQe8o9LTB8"
SHEET_NAME = "Form Responses 1"
SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

# Database Settings
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "port": int(os.getenv("DB_PORT") or 3306)
}

def load_last_sync():
    """Load the last successful sync timestamp."""
    if os.path.exists(LAST_SYNC_FILE):
        try:
            with open(LAST_SYNC_FILE, "r") as f:
                data = json.load(f)
                return data.get("last_sync_timestamp")
        except Exception:
            return None
    return None

def save_last_sync(timestamp):
    """Save the last successful sync timestamp."""
    with open(LAST_SYNC_FILE, "w") as f:
        json.dump({"last_sync_timestamp": timestamp}, f)

def fetch_sheet_data():
    """Fetch all responses from the Google Sheet."""
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        raise FileNotFoundError(f"Service account file not found at {SERVICE_ACCOUNT_FILE}")
        
    creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build("sheets", "v4", credentials=creds)

    result = service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f"{SHEET_NAME}!A:N"
    ).execute()

    values = result.get("values", [])
    if len(values) <= 1:
        return pd.DataFrame()

    headers = values[0]
    data = values[1:]
    
    num_cols = len(headers)
    padded_data = []
    for row in data:
        if len(row) < num_cols:
            row.extend([""] * (num_cols - len(row)))
        padded_data.append(row[:num_cols])

    return pd.DataFrame(padded_data, columns=headers)

def sync_to_db(df):
    """Sync DataFrame rows to the MySQL patients table and return the latest timestamp."""
    if df.empty:
        return None

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        import sys
        
        # Initialize Twilio client dynamically
        twilio_client = None
        try:
            from app.whatsapp.twilio_client import TwilioWhatsAppClient
            twilio_client = TwilioWhatsAppClient()
        except Exception as te:
            print(f"[WARNING] Could not initialize Twilio client for welcomes: {te}")
            
        count = 0
        latest_ts = None
        
        for _, row in df.iterrows():
            # Mandatory Google Forms column
            ts_str = row.get("Timestamp")
            
            name = row.get("Full Name", "")
            raw_phone = str(row.get("Contact Number", "")).strip().replace(" ", "").replace("-", "")
            
            # Normalize Sri Lankan Google Form numbers to Twilio E.164 exact format (+947...)
            clean_phone = raw_phone
            if raw_phone.startswith("07"):
                clean_phone = "+94" + raw_phone[1:]
            elif raw_phone.startswith("7"):
                clean_phone = "+94" + raw_phone
            elif raw_phone.startswith("94"):
                clean_phone = "+" + raw_phone
                
            phone = clean_phone
            lang = row.get("Language Preference", "English")
            dob = row.get("Date of Birth", "")
            age = row.get("Age", "")
            consent_raw = str(row.get("Do you consent to receive medicine dosage reminders from the pharmacy?", "")).lower()
            consent = 1 if "yes" in consent_raw else 0
            
            if not phone:
                continue

            # Check if this patient already exists (to prevent spamming updates)
            cursor.execute("SELECT id FROM patients WHERE phone_number = %s", (phone,))
            is_new_patient = (cursor.fetchone() is None)

            # Encrypt sensitive data before inserting
            enc_name = encrypt_data(name)
            enc_phone = encrypt_data(phone)
            enc_lang = encrypt_data(lang)
            enc_dob = encrypt_data(dob)

            query = """
                INSERT INTO patients (name, phone_number, language, date_of_birth, consent, age)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    language = VALUES(language),
                    date_of_birth = VALUES(date_of_birth),
                    consent = VALUES(consent),
                    age = VALUES(age)
            """
            cursor.execute(query, (enc_name, enc_phone, enc_lang, enc_dob, consent, age))
            
            # Sub-task: Send automated welcome message if this was a brand new registration
            if is_new_patient and twilio_client:
                firstName = name.split()[0] if name else ""
                welcome_msg = (
                    f"Hi {firstName}! 🎉\n\n"
                    "Your HealixPharm registration is completed "
                    "You now have full access to our pharmacy bot services.\n\n"
                    "Please reply with *'hi'* or *'menu'* right here to get started!"
                )
                try:
                    twilio_client.send_text(phone, welcome_msg)
                    print(f"[WB_SERVICE] Sent automated registration welcome to {phone}")
                except Exception as we:
                    print(f"[WARNING] Failed to send welcome to {phone}: {we}")
            
            count += 1
            
            # Keep track of the latest timestamp in the processed batch
            if ts_str:
                latest_ts = ts_str

        conn.commit()
        if count > 0:
            print(f"[SUCCESS] Updated {count} patient(s) in the database.")
        
        cursor.close()
        conn.close()
        return latest_ts
        
    except Exception as e:
        print(f"[ERROR] Database update failed: {e}")
        return None

def main():
    print("--- Incremental Patient Data Synchronization Service ---")
    print("Optimization: Only processing rows newer than last sync.")
    print("Press Ctrl+C to stop.")
    
    while True:
        try:
            current_time = time.strftime('%Y-%m-%d %H:%M:%S')
            last_sync = load_last_sync()
            
            print(f"\n[{current_time}] Syncing data from Google Sheets...")
            if last_sync:
                print(f"Tracking increments since: {last_sync}")
            
            df = fetch_sheet_data()
            if df.empty:
                print("No data found in Google Sheets.")
            else:
                # Incremental filter
                if last_sync and "Timestamp" in df.columns:
                    # Filter for rows where Timestamp >= last_sync
                    # This ensures sibling entries with same-second timestamps are never missed.
                    try:
                        df["Timestamp_Parsed"] = pd.to_datetime(df["Timestamp"])
                        last_sync_dt = pd.to_datetime(last_sync)
                        df_filtered = df[df["Timestamp_Parsed"] >= last_sync_dt].copy()
                        df_filtered = df_filtered.drop(columns=["Timestamp_Parsed"])
                    except Exception as te:
                        print(f"[WARNING] Timestamp parsing failed, falling back to full sync: {te}")
                        df_filtered = df
                else:
                    df_filtered = df

                if df_filtered.empty:
                    print("No new rows since last sync.")
                else:
                    print(f"Found {len(df_filtered)} new row(s). Updating database...")
                    latest_timestamp = sync_to_db(df_filtered)
                    
                    if latest_timestamp:
                        save_last_sync(latest_timestamp)
            
        except Exception as e:
            print(f"[ERROR] Sync cycle failed: {e}")
        
        # Wait for 30 seconds
        print("Waiting 30 seconds for next sync...")
        time.sleep(30)

if __name__ == "__main__":
    main()