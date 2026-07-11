# MoneyFlow AI: Comprehensive Architecture & Feature Guide

This document provides a complete technical briefing for the MoneyFlow AI application, designed for developers and AI assistants to understand the system's inner workings.

---

## 🚀 Tech Stack

### Frontend (User Interface)
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4.0 (Modern utility-first CSS)
- **Interactions**: Framer Motion (Fluid animations), Lucide React (Icons)
- **Visuals**: Chart.js, Recharts, Spline (3D & Interactive charts), Lottie (Animations)
- **Routing**: React Router v7
- **Logic**: Custom hooks for local storage synchronization and auth state.

### Backend (Server Logic)
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: 
  - JWT (JSON Web Tokens) for session security.
  - Passport.js with Google OAuth 2.0 integration.
  - Custom OTP (Email-based) for manual registration.
- **AI Core**: 
  - **Provider**: Groq API (LLM Orchestration)
  - **Model**: `llama-3.3-70b-versatile`
- **Other Utilities**:
  - **OCR**: Tesseract.js (Extracting text from receipts)
  - **Mail**: Nodemailer (Automated reports & OTPs)
  - **Voice**: Groq Whisper (Audio-to-text processing)

### Infrastructure & DevOps
- **Deployment**: Ansible (End-to-end automation)
- **Containerization**: Docker & Docker Compose
- **Proxy**: Nginx (Reverse proxy & Static file serving)
- **Monitoring**: Prometheus (Metrics collection) & Grafana (Visualization/Dashboards)

---

## 🏗️ System Architecture

### 1. Data Flow
1. **Input**: User interacts via Web UI (Manual Entry, Voice Record, or Receipt Upload).
2. **Backend**: Express server authenticates the request via JWT.
3. **AI Processing**: 
   - **Voice/Receipt**: Raw data is sent to Groq/Tesseract. The resulting text is parsed by the LLM (`openai.js` service) into a structured JSON expense object.
   - **Chat/Insights**: User queries are combined with real-time financial data from MongoDB and sent to the LLM for context-aware advice.
4. **Storage**: Finalized data is indexed in MongoDB for lightning-fast retrieval and reporting.
5. **Reporting**: Background logic triggers monthly summaries and email notifications.

### 2. Deployment Topology
- **Production Host**: Ubuntu/Linux server managed via Ansible.
- **Isolation**: Each component (Backend, Frontend, DB, Monitoring) runs in isolated Docker containers.
- **Security**: Nginx manages SSL (if configured) and acts as the entry point, routing `/` to Frontend and `/api` to Backend.

---

## 🛠️ Core Features & Functions

### 💰 Expense Management
- **Smart Entry**: Add expenses manually or via Voice/Receipt.
- **Categorization**: Automatic categorization (Food, Transport, Shopping, etc.) using AI.
- **Persistence**: Full history tracking with sorting and filtering.

### 🤖 AI Capabilities
- **Financial Advisor**: Context-aware chat that understands your specific spending habits and gives professional advice.
- **Actionable Insights**: Periodic analysis comparing current spending with last week/month to identify spikes or saving opportunities.
- **OCR Parsing**: Converts photos of receipts into line-item expenses automatically.
- **Voice Entry**: Transcend manual typing—just say "I spent 500 on dinner" and the AI handles the rest.

### 📊 Analytics & Reporting
- **Dynamic Dashboards**: Real-time spending graphs and category breakdowns.
- **Monthly Summary**: Automated generation of a "Month at a Glance" report with personalized insights.
- **Email Notifications**: Weekly/Monthly reports delivered straight to the user's inbox with suggestions for improvement.

### 🔐 Authentication & Profile
- **Global Auth**: JWT-protected routes for both Frontend and Backend.
- **Google Sync**: Seamless login via Google accounts.
- **Multi-Currency Support**: Real-time currency conversion using Frankfurter API (Base: INR).

---

## 📂 Key Files Reference
- `moneyflow-backend/index.js`: Main entry point & Auth middleware.
- `moneyflow-backend/routes/ai.js`: AI, OCR, and Voice logic endpoint.
- `moneyflow-backend/services/openai.js`: Groq/LLM service configuration.
- `moneyflow-frontend/src/App.jsx`: Main routing and global state.
- `ansible/complete-deployment.yml`: Master automation playbook.
