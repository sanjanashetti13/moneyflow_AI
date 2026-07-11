#  MoneyFlowAI - Interdimensional Financial Assistant


![MoneyFlowAI Banner](assets/Screenshot%202026-03-23%20232041.png)

**MoneyFlowAI** is a premium, AI-driven financial management ecosystem designed to bring interdimensional intelligence to your personal finance. Featuring a sophisticated 3D assistant, voice-powered automation, and robust infrastructure, it's the ultimate tool for modern money management.

---

## 🚀 Key Features

### 🤖 3D AI Assistant
*   **Interactive 3D Robot:** Engage with a fully interactive Spline-integrated assistant that guides you through your finances.
*   **Real-time AI Chat:** Powered by **Groq**, get instant financial advice based on your real spending habits.

### 🎙️ Voice & Automation
*   **Voice Expense Entry:** Record transactions just by speaking! Integrated with **Groq Whisper** for lightning-fast transcription.
*   
### 💼 Smart Management
*   **Multi-Currency Engine:** Automatic conversion from INR to global currencies with live exchange rates.
*   **Global Auth:** Secure login via **Google OAuth** or verified **OTP-based Email authentication**.
*   **Actionable Insights:** Monthly summaries and spending predictions to stay ahead of your budget.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React + Vite
- **Styling:** Tailwind CSS + Framer Motion
- **Interactions:** Spline 3D + Lucide Icons
- **State/API:** Axios + Context API

### Backend
- **Engine:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Services:** Groq (Whisper), OpenAI (GPT), Nodemailer
- **OCR:** Tesseract.js

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Orchestration:** Ansible
- **Monitoring:** Prometheus & Grafana
- **Proxy:** Nginx Reverse Proxy

---

## 🏗️ Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- MongoDB Atlas

### Local Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Pavan-Sanjana-KLE/MoneyFlowAI.git
   cd MoneyFlowAI
   ```

2. **Backend Setup:**
   ```bash
   cd moneyflow-backend
   npm install
   # Create .env with MONGO_URI, JWT_SECRET, GROQ_API_KEY, etc.
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd moneyflow-frontend
   npm install
   npm run dev
   ```

---

## 🚢 Deployment

MoneyFlowAI uses **Ansible** for automated, production-ready deployments.

```bash
cd ansible
# Update inventory for your host
./start_everything.sh
```

This will automatically:
- Install and configure Docker CE.
- Deploy the **Nginx Reverse Proxy**.
- Start the **Backend & Frontend** containers.
- Launch the **Monitoring Stack** (Prometheus & Grafana).

---

## 📊 Monitoring

Once deployed, you can monitor system health and metrics at:
- **Grafana:** `http://your-ip:3001`
- **Prometheus:** `http://your-ip:9090`

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Designed with ✨ by the MoneyFlow AI Team.**
