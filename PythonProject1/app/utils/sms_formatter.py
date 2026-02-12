
def format_refill_sms(patient_name: str, days_left: int) -> str:
    return (
        f"Hello {patient_name}, "
        f"your prescribed medicines will finish in {days_left} days. "
        "Please place a refill order to continue your treatment."
    )
