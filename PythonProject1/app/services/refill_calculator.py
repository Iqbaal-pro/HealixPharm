class RefillCalculator:
    def __init__(self, dose_per_day: int, total_quantity: int, issued_quantity: int):
        self.dose_per_day = dose_per_day
        self.total_quantity = total_quantity
        self.issued_quantity = issued_quantity

    def remaining_doses(self) -> int:
        return max(self.total_quantity - self.issued_quantity, 0)

    def days_left(self) -> int:
        if self.dose_per_day <= 0:
            return 0
        return self.remaining_doses() // self.dose_per_day

    def needs_refill(self, threshold_days: int = 3) -> bool:
        return self.days_left() <= threshold_days