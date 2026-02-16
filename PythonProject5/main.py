from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse, JSONResponse
import requests

app = FastAPI()

# ===============================
# CONFIG (ONLY EDIT TOKEN LATER)
# ===============================
VERIFY_TOKEN = "HEAL"

PHONE_NUMBER_ID = "973507845836211"     # ✅ REQUIRED
WHATSAPP_TOKEN = "EAAQ5SCWui14BQcTBp4mGR3vjGsoNxCtHoe6in5ZCekfCRc1IDyMJtk9MacAxZAJxGB78Cw9Ny3ZBgfcoDySqJmoJkuBXBRPoZBLaZALMwAVkuCkZCfSmkU7G9O9b0DED5r6UPoJw0oPt6NrcQRSlKuKyynDQ4yL1ZBwNowbYXztOAZChunUSbPKAWxPrIU0FDvVZCf6kd9sE2VLFhnohZACtZAZByFtFQ1yiTIbUkp2yxlRanZAwQtbSthZCODIkMAsDsfjx8XS5Pqe5NSf1YGUtuSzszP2AZDZD"

META_URL = f"https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages"

HEADERS = {
    "Authorization": f"Bearer {WHATSAPP_TOKEN}",
    "Content-Type": "application/json"
}

# ===============================
# WEBHOOK VERIFICATION (GET)
# ===============================
@app.get("/webhook")
async def verify_webhook(request: Request):
    params = request.query_params

    if (
        params.get("hub.mode") == "subscribe"
        and params.get("hub.verify_token") == VERIFY_TOKEN
    ):
        return PlainTextResponse(params.get("hub.challenge"))

    return PlainTextResponse("Verification failed", status_code=403)

# ===============================
# RECEIVE MESSAGES (POST)
# ===============================
@app.post("/webhook")
async def receive_webhook(request: Request):
    data = await request.json()
    print("WEBHOOK:", data)

    try:
        value = data["entry"][0]["changes"][0]["value"]

        if "messages" not in value:
            return JSONResponse({"status": "ignored"})

        msg = value["messages"][0]
        user = msg["from"]

        # -------- TEXT MESSAGE --------
        if msg["type"] == "text":
            # Greet user and send menu for all incoming text messages
            send_text(user, "Welcome Healix Pharm")
            send_menu(user)

        # -------- BUTTON CLICK --------
        elif msg["type"] == "interactive":
            button_id = msg["interactive"]["button_reply"]["id"]

            if button_id == "order":
                send_text(user, "Please upload your prescription photo.")
            elif button_id == "doctor":
                send_text(user, "Doctor channeling coming soon.")
            elif button_id == "disease":
                send_text(user, "Disease updates coming soon.")
            elif button_id == "agent":
                send_text(user, "An agent will contact you.")

    except Exception as e:
        print("ERROR:", e)

    return JSONResponse({"status": "ok"})


# ===============================
# SEND TEXT
# ===============================
def send_text(to, text):
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": text}
    }

    r = requests.post(META_URL, headers=HEADERS, json=payload)
    print("TEXT STATUS:", r.status_code, r.text)

# ===============================
# SEND BUTTON MENU
# ===============================
def send_menu(to):
    payload = {
        "messaging_product": "whatsapp",   # ✅ REQUIRED
        "to": to,
        "type": "interactive",
            "interactive": {
            "type": "button",
            "body": {
                "text": "Welcome Healix Pharm\nChoose an option:"
            },
            "action": {
                "buttons": [
                    {
                        "type": "reply",
                        "reply": {"id": "order", "title": "Order Medicine"}
                    },
                    {
                        "type": "reply",
                        "reply": {"id": "doctor", "title": "Channel Doctor"}
                    },
                    {
                        "type": "reply",
                        "reply": {"id": "disease", "title": "Disease Updates"}
                    },
                    {
                        "type": "reply",
                        "reply": {"id": "agent", "title": "Contact Agent"}
                    }
                ]
            }
        }
    }

    res = requests.post(META_URL, headers=HEADERS, json=payload)
    print("MENU STATUS:", res.status_code, res.text)

