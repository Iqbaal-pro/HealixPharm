import math


class RefillCalculator:
    """
    [Refill Reminders] — Calculates whether a patient's medicine stock needs a refill.
    Takes total quantity, issued quantity, and dose_per_day to compute days remaining.
    """

    def __init__(self, dose_per_day: int, total_quantity: int, issued_quantity: int, interval_hours: int = None):
        # [Refill Reminders]
        self.dose_per_day = dose_per_day
        self.total_quantity = total_quantity
        self.issued_quantity = issued_quantity
        self.interval_hours = interval_hours

    def remaining_doses(self) -> int:
        # [Refill Reminders] — how many doses are still left in stock
        return max(self.total_quantity - self.issued_quantity, 0)

    def days_left(self) -> int:
        # [Refill Reminders] — how many full days of stock remain
        if not self.dose_per_day or self.dose_per_day <= 0:
            return 0
        return math.ceil(self.remaining_doses() / self.dose_per_day)

    def needs_refill(self, threshold_days: int = 3) -> bool:
        # [Refill Reminders] — returns True if stock will run out within threshold_days
        return self.days_left() <= threshold_days
