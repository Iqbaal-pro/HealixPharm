import logging
import uuid
from datetime import datetime
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse, PlainTextResponse
from sqlalchemy.orm import Session
from app.db import get_db
from app.db_channelling import get_channelling_db
from app.models_channelling import Doctor
from app.services.echannelling_service import (
    is_slot_taken, 
    create_pending_appointment, 
    update_appointment_status,
    get_doctor_by_id
)
from app.services.payment_service import get_payment_params, verify_notify_signature
from app.services.order_service import get_or_create_user
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/channelling", tags=["E-Channelling"])

@router.get("", response_class=HTMLResponse)
async def booking_portal(request: Request, db: Session = Depends(get_channelling_db)):
    """
    Simple HTML landing page for the booking portal.
    """
    doctors = db.query(Doctor).all()
    doctor_options = "".join([
        f'<option value="{d.id}">{d.name} ({d.specialty}) - LKR {d.fee}</option>' 
        for d in doctors
    ])
    
    return f"""
    <html>
        <head><title>HealixPharm - Doctor Booking</title></head>
        <body>
            <h1>Welcome to HealixPharm E-Channelling</h1>
            <p>Select a doctor and specialty to book an appointment.</p>
            <form action="/channelling/book" method="POST">
                <label>Phone Number (WhatsApp):</label><br>
                <input type="text" name="phone" placeholder="947..." required><br><br>
                
                <label>Select Doctor:</label><br>
                <select name="doctor_id">
                    {doctor_options}
                </select><br><br>

                <label>Select Date & Time (UTC):</label><br>
                <input type="datetime-local" name="appointment_time" required><br><br>

                <button type="submit">Proceed to Payment</button>
            </form>
        </body>
    </html>
    """

@router.get("/doctors")
async def get_doctors(db: Session = Depends(get_channelling_db)):
    """List available doctors from DB."""
    return db.query(Doctor).all()

@router.post("/book")
async def initiate_booking(
    request: Request, 
    db_main: Session = Depends(get_db),
    db_chan: Session = Depends(get_channelling_db)
):
    """
    Initiate booking from the portal.
    """
    try:
        data = await request.form()
        phone = data.get("phone")
        doctor_id = int(data.get("doctor_id"))
        time_str = data.get("appointment_time")
        
        if not all([phone, doctor_id, time_str]):
            raise HTTPException(status_code=400, detail="Missing required booking info")

        appointment_time = datetime.fromisoformat(time_str)
        
        # Get doctor details
        doctor = get_doctor_by_id(db_chan, doctor_id)
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")

        # Check if slot is taken
        if is_slot_taken(db_chan, doctor_id, appointment_time):
            return JSONResponse({"status": "error", "message": "This slot is already booked. Please choose another."}, status_code=400)

        # Get or create user in MAIN DB
        user = get_or_create_user(db_main, phone=phone)
        
        # Generate unique PayHere order_id
        payhere_order_id = f"APP-{uuid.uuid4().hex[:8].upper()}"

        # Save pending appointment in CHANNELLING DB
        appointment = create_pending_appointment(
            db_chan, 
            user.id, 
            user.phone,
            doctor.id,
            doctor.name, 
            doctor.specialty, 
            appointment_time, 
            doctor.fee, 
            payhere_order_id
        )

        # Get PayHere checkout parameters
        payment_params = get_payment_params(appointment, user.phone, user.name)

        # HTML redirect form
        html_redirect = f"""
        <html>
            <body>
                <form id="payhere_form" action="{settings.PAYHERE_BASE_URL}" method="POST">
                    {''.join([f'<input type="hidden" name="{k}" value="{v}">' for k, v in payment_params.items()])}
                </form>
                <script type="text/javascript">
                    document.getElementById('payhere_form').submit();
                </script>
            </body>
        </html>
        """
        return HTMLResponse(content=html_redirect)

    except Exception as e:
        logger.error(f"[CHANN_ROUTES] Error initiating booking: {e}", exc_info=True)
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

@router.post("/payment/notify")
async def payhere_notify(request: Request, db: Session = Depends(get_channelling_db)):
    """
    Handle PayHere notification.
    """
    try:
        form_data = await request.form()
        payload = dict(form_data)
        logger.info(f"[CHANN_PAYMENT] Received PayHere notification: {payload}")

        if verify_notify_signature(payload):
            order_id = payload.get("order_id")
            status_code = payload.get("status_code")

            if status_code == "2": # Success
                update_appointment_status(db, order_id, "PAID")
                logger.info(f"[CHANN_PAYMENT] Appointment {order_id} confirmed (PAID)")
            elif status_code == "-1": # Cancelled
                update_appointment_status(db, order_id, "CANCELLED")
            else:
                update_appointment_status(db, order_id, "FAILED")
            
            return PlainTextResponse("OK")
        else:
            logger.warning("[CHANN_PAYMENT] Invalid signature for PayHere notification")
            return HTMLResponse(status_code=400)

    except Exception as e:
        logger.error(f"[CHANN_PAYMENT] Error handling PayHere notification: {e}", exc_info=True)
        return HTMLResponse(status_code=500)

@router.get("/payment/return")
async def payhere_return(order_id: str):
    return HTMLResponse(f"<h1>Payment Successful</h1><p>Your appointment {order_id} is being processed.</p>")

@router.get("/payment/cancel")
async def payhere_cancel(order_id: str):
    return HTMLResponse(f"<h1>Payment Cancelled</h1><p>The payment for {order_id} was cancelled.</p>")
