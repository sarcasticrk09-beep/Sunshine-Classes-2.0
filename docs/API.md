# Sunshine ERP Backend API Specifications

This document catalogs the REST API endpoints hosted by our full-stack Express server (`server.ts`). All backend endpoints are routed under `/api/*` and use JSON formatting.

---

## 🔑 Base Endpoints

---

### 1. Online Admission Intake
Collects demographic data for student enrollment requests, generates default login profiles, provisions monthly invoices, and logs audit records.

- **Endpoint**: `POST /api/enroll` (Alias: `POST /api/admissions`)
- **Authentication**: None (Public Access)
- **Request Headers**: `Content-Type: application/json`
- **Request Payload**:
  ```json
  {
    "studentName": "Aarav Sharma",
    "fatherName": "Rajesh Sharma",
    "motherName": "Sita Sharma",
    "dob": "2011-05-15",
    "gender": "Male",
    "className": "Class 10",
    "mobile": "9876543210",
    "email": "aarav@example.com",
    "address": "123 Academic Block, Pihani",
    "preferredBatch": "Class 10 - Evening Stars"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "admissionId": "ADM-2026-003",
    "student": {
      "id": "s-gen-9281x",
      "rollNo": "SC-1004",
      "name": "Aarav Sharma",
      "class": "Class 10",
      "preferredBatch": "Class 10 - Evening Stars"
    },
    "user": {
      "username": "aarav",
      "role": "STUDENT",
      "plainTextPassword": "Sunshine123"
    },
    "feeRecordsCreated": 12
  }
  ```

---

### 2. AI Chatbot Orchestration
Proxies requests from our student-facing inline Chatbot to the Google GenAI SDK using server-side keys.

- **Endpoint**: `POST /api/chat`
- **Authentication**: Authenticated User Session
- **Request Payload**:
  ```json
  {
    "message": "What are the timings for Class 10 Evening Stars?",
    "history": [
      { "role": "user", "text": "Hi, I have a question." },
      { "role": "model", "text": "Sure! How can I help you today?" }
    ]
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "reply": "Class 10 - Evening Stars meets from 04:00 PM to 06:30 PM, Monday through Friday."
  }
  ```

---

### 3. Outbound Twilio WhatsApp Alerts
Triggers WhatsApp text messages directly to parent mobiles for billing cycles or general notices.

- **Endpoint**: `POST /api/send-whatsapp`
- **Authentication**: Admin / receptionist credentials
- **Request Payload**:
  ```json
  {
    "to": "+919876543210",
    "message": "Dear Parent, this is a reminder that the tuition fee of ₹1,200 for July 2026 is pending. Kindly clear the dues before the deadline."
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "status": "queued",
    "messageSid": "SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  }
  ```

---

### 4. Transactional SMTP Email Pipeline
Dispatches HTML-templated transactional emails to parents, students, or teachers.

- **Endpoint**: `POST /api/send-email`
- **Authentication**: Admin / receptionist credentials
- **Request Payload**:
  ```json
  {
    "to": "aarav@example.com",
    "subject": "Sunshine Classes Admission Confirmation",
    "html": "<h1>Welcome Aarav!</h1><p>Your enrollment has been approved. Your username is <b>aarav</b> and default password is <b>Sunshine123</b>.</p>"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "messageId": "<56ef3-10ba@example.com>"
  }
  ```
