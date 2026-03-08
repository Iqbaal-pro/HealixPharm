# tests/test_refill_calculator.py
import pytest
from app.services.refill_calculator import RefillCalculator


# [Refill Reminders] — unit tests for RefillCalculator

def test_remaining_doses():
    # [Refill Reminders] — verify remaining doses = total - issued
    calc = RefillCalculator(dose_per_day=2, total_quantity=10, issued_quantity=4, interval_hours=12)
    assert calc.remaining_doses() == 6


def test_days_left():
    # [Refill Reminders] — verify days_left rounds up correctly
    calc = RefillCalculator(dose_per_day=2, total_quantity=10, issued_quantity=4, interval_hours=12)
    assert calc.days_left() == 3


def test_needs_refill():
    # [Refill Reminders] — verify refill is triggered when stock is below threshold
    calc = RefillCalculator(dose_per_day=2, total_quantity=10, issued_quantity=8, interval_hours=12)
    assert calc.needs_refill(threshold_days=1) is True
