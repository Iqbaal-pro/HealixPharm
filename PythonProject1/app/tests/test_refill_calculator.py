# tests/test_refill_calculator.py
import pytest
from app.services.refill_calculator import RefillCalculator

def test_remaining_doses():
    calc = RefillCalculator(dose_per_day=2, total_quantity=10, issued_quantity=4, interval_hours=12)
    assert calc.remaining_doses() == 6

def test_days_left():
    calc = RefillCalculator(dose_per_day=2, total_quantity=10, issued_quantity=4, interval_hours=12)
    assert calc.days_left() == 3

def test_needs_refill():
    calc = RefillCalculator(dose_per_day=2, total_quantity=10, issued_quantity=8, interval_hours=12)
    assert calc.needs_refill(threshold_days=1) is True
