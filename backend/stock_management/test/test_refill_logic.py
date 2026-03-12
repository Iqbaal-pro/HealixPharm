"""
Tests for the Refill Logic service.
Uses in-memory SQLite for isolation.
"""
import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
from app.models.patient import Patient
from app.models.prescription import Prescription
from app.services.refill_service import (
    calculate_remaining_days,
    check_refill_needed,
    get_eligible_prescriptions
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


# ─── Test calculate_remaining_days ──────────────────────────────────
class TestCalculateRemainingDays:

    def test_full_supply(self):
        """Patient just started – all days remaining."""
        rx = Prescription(
            patient_id=1,
            uploaded_by_staff_id=1,
            medicine_name="TestMed",
            dose_per_day=2,
            start_date=datetime.utcnow(),     # started today
            quantity_given=60                  # 60/2 = 30 days
        )
        remaining = calculate_remaining_days(rx)
        assert remaining == 30.0

    def test_halfway_through(self):
        """Patient is 10 days in with 20-day supply."""
        rx = Prescription(
            patient_id=1,
            uploaded_by_staff_id=1,
            medicine_name="TestMed",
            dose_per_day=1,
            start_date=datetime.utcnow() - timedelta(days=10),
            quantity_given=20
        )
        remaining = calculate_remaining_days(rx)
        assert remaining == 10.0

    def test_supply_exhausted(self):
        """Patient ran out of medicine."""
        rx = Prescription(
            patient_id=1,
            uploaded_by_staff_id=1,
            medicine_name="TestMed",
            dose_per_day=2,
            start_date=datetime.utcnow() - timedelta(days=20),
            quantity_given=30                  # 30/2 = 15 days, but 20 passed
        )
        remaining = calculate_remaining_days(rx)
        assert remaining == -5.0

    def test_zero_dose_per_day(self):
        """Edge case: dose_per_day is 0 → return infinity."""
        rx = Prescription(
            patient_id=1,
            uploaded_by_staff_id=1,
            medicine_name="TestMed",
            dose_per_day=0,
            start_date=datetime.utcnow(),
            quantity_given=10
        )
        remaining = calculate_remaining_days(rx)
        assert remaining == float("inf")


# ─── Test check_refill_needed ───────────────────────────────────────
class TestCheckRefillNeeded:

    def test_below_threshold(self):
        """2 days remaining with threshold=3 → needs refill."""
        rx = Prescription(
            patient_id=1,
            uploaded_by_staff_id=1,
            medicine_name="TestMed",
            dose_per_day=1,
            start_date=datetime.utcnow() - timedelta(days=8),
            quantity_given=10
        )
        assert check_refill_needed(rx, threshold=3) is True

    def test_at_threshold(self):
        """Exactly 3 days remaining with threshold=3 → needs refill."""
        rx = Prescription(
            patient_id=1,
            uploaded_by_staff_id=1,
            medicine_name="TestMed",
            dose_per_day=1,
            start_date=datetime.utcnow() - timedelta(days=7),
            quantity_given=10
        )
        assert check_refill_needed(rx, threshold=3) is True

    def test_above_threshold(self):
        """15 days remaining with threshold=3 → no refill needed."""
        rx = Prescription(
            patient_id=1,
            uploaded_by_staff_id=1,
            medicine_name="TestMed",
            dose_per_day=1,
            start_date=datetime.utcnow() - timedelta(days=5),
            quantity_given=20
        )
        assert check_refill_needed(rx, threshold=3) is False


# ─── Test get_eligible_prescriptions ────────────────────────────────
class TestGetEligiblePrescriptions:

    def test_consent_filter(self, db_session):
        """Patient without consent should NOT appear in eligible list."""
        # Patient without consent
        patient = Patient(
            name="No Consent",
            phone_number="+1234",
            consent=False
        )
        db_session.add(patient)
        db_session.commit()
        db_session.refresh(patient)

        rx = Prescription(
            patient_id=patient.id,
            uploaded_by_staff_id=1,
            medicine_name="TestMed",
            dose_per_day=1,
            start_date=datetime.utcnow() - timedelta(days=28),
            quantity_given=30,
            is_continuous=True
        )
        db_session.add(rx)
        db_session.commit()

        eligible = get_eligible_prescriptions(db_session)
        rx_ids = [e.id for e in eligible]
        assert rx.id not in rx_ids

    def test_continuous_with_consent(self, db_session):
        """Continuous prescription for consented patient → eligible."""
        patient = Patient(
            name="Consented",
            phone_number="+5678",
            consent=True
        )
        db_session.add(patient)
        db_session.commit()
        db_session.refresh(patient)

        rx = Prescription(
            patient_id=patient.id,
            uploaded_by_staff_id=1,
            medicine_name="Eligible Med",
            dose_per_day=1,
            start_date=datetime.utcnow() - timedelta(days=28),
            quantity_given=30,       # 2 days left < threshold 3
            is_continuous=True
        )
        db_session.add(rx)
        db_session.commit()
        db_session.refresh(rx)

        eligible = get_eligible_prescriptions(db_session)
        rx_ids = [e.id for e in eligible]
        assert rx.id in rx_ids
