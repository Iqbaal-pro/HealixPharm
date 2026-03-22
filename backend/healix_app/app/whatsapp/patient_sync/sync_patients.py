import os
import sys

# Add project root to path for imports MUST BE BEFORE IMPORTS
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

import pandas as pd
import mysql.connector
import time
import json
from datetime import datetime
from dotenv import load_dotenv
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from app.utils.encryption import encrypt_data
load_dotenv()

# Google Sheets Settings
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_FILE = os.path.join(BASE_DIR, "service_account.json")
LAST_SYNC_FILE = os.path.join(BASE_DIR, "last_sync.json")
SPREADSHEET_ID = "12K70ehIvsFf8F6e5NFPwcCg_-lgH0QbU0ZQe8o9LTB8"
SHEET_NAME = "Form Responses 1"
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

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
            
        # Build in-memory cache of existing patients (decrypted)
        cursor.execute("SELECT phone_number FROM patients")
        existing_rows = cursor.fetchall()
        existing_phones = set()
        from app.utils.encryption import decrypt_data
        
        for (enc_p,) in existing_rows:
            try:
                dec_p = decrypt_data(enc_p)
                if dec_p:
                    existing_phones.add(dec_p)
            except Exception:
                continue

        count = 0
        latest_ts = None
        
        for _, row in df.iterrows():
            try:
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
                consent = 1 if ("yes" in consent_raw or "agree" in consent_raw) else 0
                
                if not phone:
                    continue

                # Check if this patient already exists via in-memory cache
                if phone in existing_phones:
                    # Update potentially? Yes, let's update.
                    # Build encrypted update
                    enc_name = encrypt_data(name)
                    # enc_lang = encrypt_data(lang) # No longer encrypting language
                    enc_dob = encrypt_data(dob)

                    # Find ID
                    cursor.execute("SELECT id, phone_number FROM patients")
                    target_id = None
                    for pid, ephone in cursor.fetchall():
                        try:
                            if decrypt_data(ephone) == phone:
                                target_id = pid
                                break
                        except: continue
                    
                    if target_id:
                        query = "UPDATE patients SET name=%s, language=%s, date_of_birth=%s, consent=%s, age=%s WHERE id=%s"
                        cursor.execute(query, (enc_name, lang, enc_dob, consent, age, target_id))
                        conn.commit()
                else:
                    # Brand new patient
                    enc_name = encrypt_data(name)
                    enc_phone = encrypt_data(phone)
                    # enc_lang = encrypt_data(lang) # No longer encrypting language
                    enc_dob = encrypt_data(dob)

                    query = """
                        INSERT INTO patients (name, phone_number, language, date_of_birth, consent, age)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """
                    cursor.execute(query, (enc_name, enc_phone, lang, enc_dob, consent, age))
                    conn.commit()
                    
                    # Log success and update cache
                    existing_phones.add(phone)
                    count += 1
                    
                    # Send Welcome message ONLY for truly new additions after successful commit
                    if twilio_client:
                        firstName = name.split()[0] if name else ""
                        welcome_msg = (
                            f"Hi {firstName}! 🎉\n\n"
                            "Your HealiXharm registration is completed.\n\n"
                            "Please reply with *'hi'* or *'menu'* right here to get started!"
                        )
                        try:
                            twilio_client.send_text(phone, welcome_msg)
                            print(f"[WB_SERVICE] Sent automated registration welcome to {phone}")
                        except Exception as we:
                            print(f"[WARNING] Failed to send welcome to {phone}: {we}")

                # Update the progress timestamp
                if ts_str:
                    latest_ts = ts_str

            except Exception as row_err:
                print(f"[WARNING] Failed to process row for '{row.get('Full Name')}': {row_err}")
                conn.rollback()

        if count > 0:
            print(f"[SUCCESS] Synced {count} new patient(s) in this cycle.")
        
        cursor.close()
        conn.close()
        return latest_ts
        
    except Exception as e:
        print(f"[ERROR] Sync session failed: {e}")
        return None

def reverse_sync_deletions(service, last_sync):
    """
    Identifies rows in the Google Sheet that are NO LONGER in the database
    (manual deletions) and removes them from the worksheet.
    """
    if not last_sync:
        return

    try:
        # 1. Fetch all phone numbers from DB (decrypted)
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT phone_number FROM patients")
        rows = cursor.fetchall()
        from app.utils.encryption import decrypt_data
        db_phones = set()
        for (enc_p,) in rows:
            try:
                dec_p = decrypt_data(enc_p)
                if dec_p: db_phones.add(dec_p)
            except: continue
        cursor.close()
        conn.close()

        # 2. Fetch all rows from Google Sheet
        result = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=f"{SHEET_NAME}!A:N"
        ).execute()
        values = result.get("values", [])
        if not values: return

        headers = values[0]
        try:
            ts_idx = headers.index("Timestamp")
            phone_idx = headers.index("Contact Number")
        except (ValueError, IndexError):
            print("[ERROR] Required headers ('Timestamp', 'Contact Number') not found in Sheet.")
            return

        rows_to_delete = []
        last_sync_dt = pd.to_datetime(last_sync)

        # Start from index 1 (skip headers)
        for i in range(1, len(values)):
            row = values[i]
            # Ensure row has required columns
            if len(row) <= max(ts_idx, phone_idx): continue 
            
            ts_str = row[ts_idx]
            raw_phone = str(row[phone_idx]).strip().replace(" ", "").replace("-", "")
            
            # Normalize for comparison
            clean_phone = raw_phone
            if raw_phone.startswith("07"): clean_phone = "+94" + raw_phone[1:]
            elif raw_phone.startswith("7"): clean_phone = "+94" + raw_phone
            elif raw_phone.startswith("94"): clean_phone = "+" + raw_phone

            try:
                row_ts = pd.to_datetime(ts_str)
                # SAFETY: Only delete if row is at least 1 hour old (to avoid race conditions with new forms)
                # AND has a timestamp <= last_sync (meaning it should have been synced before)
                time_diff = (pd.Timestamp.now() - row_ts).total_seconds() / 3600
                
                if row_ts <= last_sync_dt and time_diff > 1:
                    if clean_phone not in db_phones:
                        rows_to_delete.append(i)
            except: continue

        if not rows_to_delete:
            return

        print(f"[REVERSE_SYNC] Found {len(rows_to_delete)} orphaned rows in Sheet. Deleting...")

        # 3. Build batch delete request (must be in descending order to keep indices valid)
        # OR use batchUpdate with multiple requests
        requests = []
        # Sort indices in descending order
        for idx in sorted(rows_to_delete, reverse=True):
            requests.append({
                "deleteDimension": {
                    "range": {
                        "sheetId": 0, # Note: Needs real sheetId if not the first sheet
                        "dimension": "ROWS",
                        "startIndex": idx,
                        "endIndex": idx + 1
                    }
                }
            })

        if requests:
            # We need the numeric sheetId. Usually 0 for the first sheet, but let's be sure.
            sheet_metadata = service.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
            sheets = sheet_metadata.get('sheets', [])
            target_sheet_id = 0
            for s in sheets:
                if s.get('properties', {}).get('title') == SHEET_NAME:
                    target_sheet_id = s.get('properties', {}).get('sheetId', 0)
                    break
            
            for r in requests:
                r["deleteDimension"]["range"]["sheetId"] = target_sheet_id

            service.spreadsheets().batchUpdate(
                spreadsheetId=SPREADSHEET_ID,
                body={"requests": requests}
            ).execute()
            print(f"[SUCCESS] Removed {len(rows_to_delete)} orphaned rows from Google Sheet.")

    except Exception as e:
        print(f"[ERROR] Reverse sync failed: {e}")

def run_patient_sync_cycle():
    """Performs a single synchronization cycle. Safe to call from a scheduler."""
    try:
        current_time = time.strftime('%Y-%m-%d %H:%M:%S')
        last_sync = load_last_sync()
        
        df = fetch_sheet_data()
        if df.empty:
            return
            
        # Incremental filter
        if last_sync and "Timestamp" in df.columns:
            try:
                df["Timestamp_Parsed"] = pd.to_datetime(df["Timestamp"])
                last_sync_dt = pd.to_datetime(last_sync)
                # Strictly greater than to avoid overlapping rows
                df_filtered = df[df["Timestamp_Parsed"] > last_sync_dt].copy()
                df_filtered = df_filtered.drop(columns=["Timestamp_Parsed"])
            except Exception as te:
                print(f"[WARNING] Timestamp parsing failed: {te}")
                df_filtered = df
        else:
            df_filtered = df

        if not df_filtered.empty:
            print(f"[{current_time}] Sync: Found {len(df_filtered)} new row(s).")
            latest_timestamp = sync_to_db(df_filtered)
            if latest_timestamp:
                save_last_sync(latest_timestamp)
        
        # Reverse sync: Delete orphaned sheet rows if they are missing from DB
        creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        service = build("sheets", "v4", credentials=creds)
        reverse_sync_deletions(service, last_sync)
        
    except Exception as e:
        print(f"[ERROR] Sync cycle failed: {e}")

def main():
    print("--- Incremental Patient Data Synchronization Service ---")
    print("Optimization: Only processing rows newer than last sync.")
    print("Mode: Standalone Loop (Press Ctrl+C to stop)")
    
    while True:
        run_patient_sync_cycle()
        # Wait for 30 seconds
        time.sleep(30)

if __name__ == "__main__":
    main()