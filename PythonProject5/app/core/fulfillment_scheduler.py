import logging
from datetime import datetime, timedelta
from app.db import SessionLocal
from app import models
from app.services.stock_integration import StockIntegrationService
from app.whatsapp.twilio_client import TwilioWhatsAppClient

logger = logging.getLogger(__name__)
stock_bridge = StockIntegrationService()
twilio_wa = TwilioWhatsAppClient()

def monitor_fulfillment(db_session=None):
    """
    Background task to monitor orders awaiting payment or selection.
    Sends reminders at 15m and 30m, cancels at 2h.
    """
    logger.info("[F_SCHEDULER] Running fulfillment monitor...")
    db = db_session if db_session else SessionLocal()
    try:
        pending_orders = db.query(models.Order).filter(
            models.Order.status.in_(["AWAITING_PAYMENT_SELECTION", "AWAITING_PAYMENT"])
        ).all()
        
        logger.info(f"[F_SCHEDULER] Found {len(pending_orders)} pending orders")

        now = datetime.utcnow()

        for order in pending_orders:
            logger.info(f"[F_SCHEDULER] Checking Order {order.token} | Status: {order.status} | Approved At: {order.approved_at}")
            if not order.approved_at:
                continue
            
            elapsed = now - order.approved_at
            logger.info(f"[F_SCHEDULER] Order {order.token} elapsed: {elapsed}")
            
            # 2. Handle Cancellation (2 Hours)
            if elapsed > timedelta(hours=2):
                cancel_and_release_order(db, order)
                continue

            # 3. Handle Reminders
            if elapsed > timedelta(minutes=30) and order.reminder_count < 2:
                send_fulfillment_reminder(db, order, reminder_num=2)
            elif elapsed > timedelta(minutes=15) and order.reminder_count < 1:
                send_fulfillment_reminder(db, order, reminder_num=1)

    except Exception as e:
        logger.error(f"[F_SCHEDULER] Monitor failed: {e}", exc_info=True)
    finally:
        if not db_session:
            db.close()

def send_fulfillment_reminder(db, order, reminder_num):
    """
    Send a reminder to the user to choose payment / pay.
    """
    try:
        msg = (
            f"Friendly Reminder 🔔 (Order {order.token})\n"
            f"You haven't confirmed your payment method yet.\n\n"
            f"PLEASE reply with:\n"
            f"1. Cash on Delivery\n"
            f"2. Online Payment\n\n"
            f"Total: Rs. {(order.total_amount or 0.0):.2f}"
        )
        if reminder_num == 2:
            msg = "⚠️ *FINAL WARNING*\n" + msg + "\nYour order will be cancelled in 30 minutes if not confirmed."

        twilio_wa.send_text(order.user.phone, msg)
        order.reminder_count = reminder_num
        db.commit()
        logger.info(f"[F_SCHEDULER] Sent reminder {reminder_num} to {order.user.phone} for order {order.token}")
    except Exception as e:
        logger.error(f"[F_SCHEDULER] Failed to send reminder: {e}")

def cancel_and_release_order(db, order):
    """
    Cancel the order and release reserved stock in MySQL.
    """
    try:
        logger.info(f"[F_SCHEDULER] Cancelling order {order.token} due to timeout.")
        
        # 1. Release Stock in MySQL
        for item in order.items:
            stock_bridge.release_stock(item.medicine_id, item.quantity)
        
        # 2. Update Order Status
        order.status = "CANCELLED"
        order.cancelled_at = datetime.utcnow()
        db.commit()

        # 3. Notify User
        msg = f"Your order {order.token} has been cancelled ❌ because no payment method was selected within 2 hours. Your medicine has been returned to stock."
        twilio_wa.send_text(order.user.phone, msg)
        
        logger.info(f"[F_SCHEDULER] Order {order.token} cancelled and stock released.")
    except Exception as e:
        logger.error(f"[F_SCHEDULER] Cancellation failed for {order.token}: {e}", exc_info=True)
        db.rollback()
