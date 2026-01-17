from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse, JSONResponse
import requests

app = FastAPI()

VERIFY_TOKEN = "HEALIX_VERIFY"
WHATSAPP_TOKEN = "EAAQ5SCWui14BQZAZCercrEBSx3isDmNqOz1GJnqqBHnQtEpDylqH7G7mkR0MF5q66Xeu9o3MgyVVjavXjcZAVEzMYytm7ZBsEIqa4fK8wZBBYoN4UTfEEcdkZBerZAc9KyHIW936ws66KoOZBCWZCVVYERzZBuhTq80Ty8gpzZBJpo7SnI9kyfbPdZCyPu5XWU7W6k5MrLs1bSDgbyssQFSlUJzdy4STIaEoauPZCZAOl0YijatjybAbKpnZCMVEG87Q7xHSRaeZA1aJH1FeYNgQXAEUJlEq"
PHONE_NUMBER_ID = "973507845836211"

META_URL = f"https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages"
HEADERS = {
    "Authorization": f"Bearer {WHATSAPP_TOKEN}",
    "Content-Type": "application/json"
}

# ---------- VERIFY ----------
@app.get("/webhook")
async def verify_webhook(request: Request):
    params = request.query_params
    if (
        params.get("hub.mode") == "subscribe"
        and params.get("hub.verify_token") == VERIFY_TOKEN
    ):
        return PlainTextResponse(params.get("hub.challenge"))
    return PlainTextResponse("Verification failed", status_code=403)

# ---------- RECEIVE ----------
@app.post("/webhook")
async def receive_webhook(request: Request):
    data = await request.json()
    print("INCOMING:", data)   # VERY IMPORTANT

    try:
        value = data["entry"][0]["changes"][0]["value"]

        if "messages" not in value:
            return JSONResponse({"status": "ignored"})

        user = value["messages"][0]["from"]

        send_text(user, "Welcome to Healix Pharm")

    except Exception as e:
        print("ERROR:", e)

    return JSONResponse({"status": "ok"})

# ---------- SEND ----------
def send_text(to, text):
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": text}
    }
    r = requests.post(META_URL, headers=HEADERS, json=payload)
    print("SEND STATUS:", r.status_code, r.text)
