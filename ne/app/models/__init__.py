# models/__init__.py
# Import all models here so that Base.metadata.create_all() registers every table.
from app.models.patient import Patient
from app.models.prescription import Prescription
from app.models.issued_item import IssuedItem
from app.models.reminder import Reminder
from app.models.reminder_log import ReminderLog
from app.models.whatsapp_user import WhatsAppUser
