class DataExporter:
    """
    Utility class to export issued medicine data
    to other system branches (e.g., Reminder system)
    """

    def prepare_issue_data(
        self,
        patient_id,
        prescription_id,
        medicine_id,
        quantity_issued,
        issued_date
    ):
        """
        Prepare data payload for external systems
        """

        payload = {
            "patient_id": patient_id,
            "prescription_id": prescription_id,
            "medicine_id": medicine_id,
            "quantity_issued": quantity_issued,
            "issued_date": issued_date
        }

        return payload
