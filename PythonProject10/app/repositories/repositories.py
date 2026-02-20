from app.models.reminder import Reminder

def save_reminder(db, reminder: Reminder):
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder
