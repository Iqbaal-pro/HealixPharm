---
description: Prescription Verification Workflow
---

# Prescription Verification Workflow

This workflow describes the end-to-end process of how patients submit prescriptions and how pharmacists verify them using the new Prescription Queue.

## 1. Patient Submission (WhatsApp)
- The patient interacts with the HealixPharm WhatsApp Bot.
- They select **"Order Medicine"** from the main menu.
- When prompted, they upload a clear photo of their prescription.
- The system checks the image for clarity (blur, brightness).
- **If clear**: The image is uploaded to **AWS S3** and a new order is created with the status `PENDING_VERIFICATION`.

## 2. Admin Queue Management (Backend)
- The prescription is now automatically tracked in the **Prescription Queue**.
- To view the queue, the pharmacist calls the endpoint:
  `GET /admin/prescriptions/queue`
- **Dynamic Fetching**: For every request, the system fetches fresh pre-signed URLs from AWS S3, ensuring the images are always viewable even if the original links expired.

## 3. Pharmacist Verification
- The pharmacist reviews the JSON response or an admin dashboard interface connected to this API.
- They open the `prescription_url` to see the actual image stored in AWS.
- Based on the image, they itemize the order (add medicines and quantities).

## 4. Order Approval
- The pharmacist approves the order via:
  `POST /admin/orders/{order_id}/approve`
- This reserves stock in the database and notifies the patient via WhatsApp to choose a payment method.
- The order status transition: `PENDING_VERIFICATION` → `AWAITING_PAYMENT_SELECTION`.

## 5. Summary of Queue logic
- **Pending**: Only `PENDING_VERIFICATION` orders show up.
- **Security**: URLs are temporary and secure (pre-signed).
- **Speed**: Background workers handle fulfillment monitoring and reminders.
