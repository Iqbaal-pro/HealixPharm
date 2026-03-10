import requests
import json

def send_sms():
    url = "https://dashboard.smsapi.lk/api/v3/sms/send"
    token = "393|E6YjD9e1f0JRDuGp401yDkPTYvwzOtj1u0C06LE6"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    payload = {
        "recipient": "+94771443155",
        "sender_id": "HealixPharm", # Based on project name, usually required by SMS APIs
        "message": "Hi Iqbaal, Medicine Reminder for Pandol, Dosage 1 tablet."
    }
    
    # Note: sender_id might be required by the API. If not specified, I'll stick to what the user provided.
    # The user request didn't specify sender_id, so I'll check if it's needed or just use a placeholder if empty.
    # Actually, let's stick strictly to the user's requirements first.
    
    payload_strict = {
        "recipient": "+94771443155",
        "sender_id": "SMSAPI Demo",
        "message": "Hi Iqbaal, Medicine Reminder for Pandol, Dosage 1 tablet."
    }

    print(f"Sending POST request to: {url}")
    print(f"Payload: {json.dumps(payload_strict, indent=4)}")
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload_strict))
        print(f"\nAPI Response Status Code: {response.status_code}")
        print("API Response Content:")
        print(response.text)
        
        if response.status_code == 403:
            print("\n[NOTE] A 403 error usually means the API token is valid but the 'Originator' (sender_id) is not authorized for this account, or is missing.")
            
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    send_sms()
