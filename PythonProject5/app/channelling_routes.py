from fastapi import APIRouter, Depends, HTTPException, Request, Form
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app.channelling_db import get_db_channelling
from app.echannelling_service import list_doctors, generate_mock_slots, create_pending_appointment, update_appointment_status
from app.payment_service import generate_payhere_hash, verify_payhere_signature
from app.core.config import settings
from app.channelling_models import Doctor, Appointment
from datetime import datetime

router = APIRouter(prefix="/channelling", tags=["Channelling"])

@router.get("/success", response_class=HTMLResponse)
async def payment_success():
    """Payment success page."""
    return """
    <html>
        <head><title>Payment Success - HealixPharm</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #4CAF50;">Payment Successful!</h1>
            <p>Your appointment has been confirmed. You will receive a confirmation message on WhatsApp shortly.</p>
            <p><a href="/">Return to Home</a></p>
        </body>
    </html>
    """

@router.get("/cancel", response_class=HTMLResponse)
async def payment_cancel():
    """Payment cancellation page."""
    return """
    <html>
        <head><title>Payment Cancelled - HealixPharm</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #f44336;">Payment Cancelled</h1>
            <p>Your payment process was cancelled. You can try booking again from the portal.</p>
            <p><a href="/channelling">Try Again</a></p>
        </body>
    </html>
    """

@router.get("/api/doctors")
async def get_doctors(db: Session = Depends(get_db_channelling)):
    """List all available doctors."""
    doctors = list_doctors(db)
    return doctors

@router.get("/api/slots")
async def get_slots(doctor_id: int):
    """Get available time slots for a doctor."""
    slots = generate_mock_slots(doctor_id)
    return slots

@router.post("/api/book")
async def book_appointment(
    user_id: int, 
    user_phone: str, 
    doctor_id: int, 
    appointment_time: str,
    db: Session = Depends(get_db_channelling)
):
    """Create a pending appointment and return PayHere checkout parameters."""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    try:
        app_time = datetime.strptime(appointment_time, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD HH:MM:SS")

    appointment = create_pending_appointment(db, user_id, user_phone, doctor, app_time)
    
    # Generate PayHere hash
    amount = float(appointment.fee)
    payhere_hash = generate_payhere_hash(
        settings.PAYHERE_MERCHANT_ID,
        appointment.payhere_order_id,
        amount,
        "LKR"
    )
    
    return {
        "appointment_id": appointment.id,
        "payhere_order_id": appointment.payhere_order_id,
        "checkout_params": {
            "merchant_id": settings.PAYHERE_MERCHANT_ID,
            "return_url": f"{settings.BASE_URL}/channelling/success",
            "cancel_url": f"{settings.BASE_URL}/channelling/cancel",
            "notify_url": f"{settings.BASE_URL}/channelling/api/payhere-notify",
            "order_id": appointment.payhere_order_id,
            "items": f"Doctor Appointment - {doctor.name}",
            "currency": "LKR",
            "amount": amount,
            "hash": payhere_hash,
            "first_name": "User",
            "last_name": str(user_id),
            "email": "user@example.com",
            "phone": user_phone,
            "address": "Colombo, Sri Lanka",
            "city": "Colombo",
            "country": "Sri Lanka"
        }
    }

@router.post("/api/payhere-notify")
async def payhere_notify(
    request: Request,
    merchant_id: str = Form(...),
    order_id: str = Form(...),
    payhere_amount: str = Form(...),
    payhere_currency: str = Form(...),
    status_code: int = Form(...),
    md5sig: str = Form(...),
    db: Session = Depends(get_db_channelling)
):
    """Handle PayHere payment notification callback."""
    # Verify signature
    is_valid = verify_payhere_signature(
        merchant_id,
        order_id,
        payhere_amount,
        payhere_currency,
        status_code,
        md5sig
    )
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Update appointment status
    appointment = update_appointment_status(db, order_id, status_code)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {"status": "success", "appointment_id": appointment.id, "new_status": appointment.status}
