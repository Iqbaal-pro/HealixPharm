
def format_refill_sms(patient_name: str, days_left: int) -> str:
    # [Refill Reminders] — build the SMS text sent to the patient when stock is low
    return (
        f"Hello {patient_name}, "
        f"your prescribed medicines will finish in {days_left} days. "
        "Please place a refill order to continue your treatment."
    )


def format_dose_sms(patient_name: str, medicine_name: str, dose_quantity: int, meal_timing: str = None) -> str:
    # [Dose Reminders] — build the SMS text for a specific dose
    timing_str = f" ({meal_timing})" if meal_timing else ""
    return (
        f"Hi {patient_name}, it's time for your {medicine_name} dose. "
        f"Take {dose_quantity} tablet(s){timing_str}. "
        "Stay healthy!"
    )
