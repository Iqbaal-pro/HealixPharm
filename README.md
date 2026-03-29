# HealixPharm Ecosystem 🏥

HealixPharm is a comprehensive digital healthcare platform designed to modernize pharmacy operations and enhance patient accessibility. The system provides a seamless patient experience through an automated 24/7 WhatsApp ordering bot, an integrated Doctor Channelling portal, and a robust administrative dashboard for pharmacists.

## 🚀 Key Features

*   **Automated WhatsApp Bot:** Patients can upload prescriptions, receive bills, select payment methods, and chat with a live agent—all directly within WhatsApp via the Twilio API.
*   **Pharmacy Admin Dashboard:** A powerful control center for pharmacists to review incoming prescriptions, manage inventory, chat with patients, and dispatch orders.
*   **Doctor Channelling Portal:** A dedicated frontend allowing patients to view doctor schedules and book appointments online.
*   **Intelligent Stock Management:** Automatically deduces stock from MySQL upon order approval. Includes a Machine Learning (Random Forest) Demand Forecasting API to predict low-stock scenarios.
*   **Automated Patient Reminders:** A scheduled background job that utilizes the Twilio SMS API to send real-time refill reminders to chronic patients.
*   **Secure Payments & Storage:** Integrated with PayHere for secure online transactions and AWS S3 for secure, encrypted storage of patient prescription images.

## 🛠 Tech Stack

**Backend Systems (Python / FastAPI / MySQL)**
*   `backend/healix_app`: Core REST APIs handling Admin Dashboard operations, WhatsApp Webhooks (Twilio), PayHere integrations, and User Support Tickets.
*   `backend/stock_management`: Dedicated inventory tracking database logic (SQLAlchemy).
*   `backend/api`: Machine Learning service hosting the custom `scikit-learn` Random Forest prediction model.

**Frontend Systems (React / Next.js)**
*   `healix-doctor-portal`: Next.js Patient portal for booking doctors. 
*   `frontend`: The main React-based Pharmacy Admin Dashboard.
*   `landing_page`: Promotional website for the system.

## ⚙️ Environment Variables Required

For full system functionality, the following API keys and configurations must be set in your `.env` files across the respective deployments:

*   **Database**: `DATABASE_URL` (MySQL connection string)
*   **WhatsApp / SMS**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`, `TWILIO_SMS_NUMBER`
*   **Storage**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`, `AWS_REGION`
*   **Payments**: `PAYHERE_MERCHANT_ID`, `PAYHERE_SECRET`
*   **CORS**: `ALLOWED_ORIGINS` (URLs of the deployed frontends)

## 📦 Running Locally

### Backend (FastAPI)
1. Navigate to the core app logic: `cd backend/healix_app`
2. Install dependencies: `pip install -r requirements.txt` (or from the project root)
3. Run the development server: `uvicorn app.main:app --reload --port 8000`

**(Optional) Run ML API:**
`uvicorn backend.api.main:app --port 8001`

### Frontend (Next.js/React)
1. Navigate to the portal: `cd healix-doctor-portal` or `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## 🚀 Deployment

The system is optimized for deployment on cloud providers like **Render**. 
* Ensure each backend service (`healix_app`, `api`) is deployed as a separate Web Service.
* The Next.js frontends (`healix-doctor-portal`) should be deployed as Web Services or Static Sites pointing exactly to their respective subdirectories.
* Ensure all database migrations (`Base.metadata.create_all`) are triggered automatically on Web Service startup via Python scripts.

---
**Contributors:** Developed by Maneth, Iqbaal, Nasrin, and Team.
