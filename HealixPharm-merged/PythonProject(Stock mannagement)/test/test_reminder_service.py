"""
Tests for the Reminder Service.
Uses in-memory SQLite for isolation.
"""
import pytest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
from app.models.patient import Patient
from app.models.prescription import Prescription
from app.models.reminder import Reminder
from app.services.reminder_service import (
    create_reminder,
    send_one_time_reminder,
    process_pending_reminders
)


# ─── Fixtures ───────────────────────────────────────────────────────
@pytest.fixture(scope="session")
def engine():
    eng = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(eng)
    return eng


@pytest.fixture(scope="function")
def db_session(engine):
    Session = sessionmaker(bind=engine)
    db = Session()
    try:
        yield db
    finally:
        db.rollback()
        db.close()


def _create_patient_and_prescription(db, consent=True):
    """Helper: insert a patient + prescription for testing."""
    patient = Patient(
        name="Test Patient",
        phone_number="+94770000000",
        language="en",
        consent=consent
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    rx = Prescription(
        patient_id=patient.id,
        uploaded_by_staff_id=1,
        medicine_name="Test Medicine",
        dose_per_day=2,
        start_date=datetime.utcnow(),
        quantity_given=60,
        is_continuous=True
    )
    db.add(rx)
    db.commit()
    db.refresh(rx)

    return patient, rx


# ─── Test create_reminder ───────────────────────────────────────────
class TestCreateReminder:

    def test_creates_pending_reminder(self, db_session):
        """create_reminder should insert a row with status='pending'."""
        _, rx = _create_patient_and_prescription(db_session)

        reminder = create_reminder(db_session, rx.id, one_time=False)

        assert reminder.id is not None
        assert reminder.status == "pending"
        assert reminder.one_time is False
        assert reminder.prescription_id == rx.id

    def test_one_time_flag(self, db_session):
        """One-time reminder should have one_time=True."""
        _, rx = _create_patient_and_prescription(db_session)

        reminder = create_reminder(db_session, rx.id, one_time=True)

        assert reminder.one_time is True


# ─── Test send_one_time_reminder ────────────────────────────────────
class TestSendOneTimeReminder:

    def test_success_with_consent(self, db_session):
        """Should succeed when patient has consent."""
        _, rx = _create_patient_and_prescription(db_session, consent=True)

        result = send_one_time_reminder(db_session, rx.id)

        assert result["success"] is True
        assert result["reminder_id"] is not None
        assert result["patient_name"] == "Test Patient"

    def test_fails_without_consent(self, db_session):
        """Should fail when patient has not given consent."""
        _, rx = _create_patient_and_prescription(db_session, consent=False)

        result = send_one_time_reminder(db_session, rx.id)

        assert result["success"] is False
        assert "consent" in result["error"].lower()

    def test_fails_invalid_prescription(self, db_session):
        """Should fail for non-existent prescription."""
        result = send_one_time_reminder(db_session, 99999)

        assert result["success"] is False
        assert "not found" in result["error"].lower()


# ─── Test process_pending_reminders ─────────────────────────────────
class TestProcessPendingReminders:

    def test_processes_pending(self, db_session):
        """Pending reminders for consented patients should be sent."""
        patient, rx = _create_patient_and_prescription(db_session, consent=True)

        # Create a pending reminder
        reminder = Reminder(
            prescription_id=rx.id,
            reminder_time=datetime.utcnow(),
            channel="sms",
            status="pending",
            one_time=False
        )
        db_session.add(reminder)
        db_session.commit()
        db_session.refresh(reminder)

        results = process_pending_reminders(db_session)

        # Should have processed at least one
        assert len(results) >= 1
        sent_ids = [r["reminder_id"] for r in results if r["success"]]
        assert reminder.id in sent_ids

    def test_skips_no_consent(self, db_session):
        """Pending reminders for non-consented patients should be skipped."""
        patient, rx = _create_patient_and_prescription(db_session, consent=False)

        reminder = Reminder(
            prescription_id=rx.id,
            reminder_time=datetime.utcnow(),
            channel="sms",
            status="pending",
            one_time=False
        )
        db_session.add(reminder)
        db_session.commit()
        db_session.refresh(reminder)

        results = process_pending_reminders(db_session)

        # The no-consent reminder should not appear in results
        processed_ids = [r["reminder_id"] for r in results]
        assert reminder.id not in processed_ids
