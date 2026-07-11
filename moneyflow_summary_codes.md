# MoneyFlow AI - Core Project Codes Summary

This file contains the core logic and configuration for the MoneyFlow AI project, including frontend, backend, and deployment scripts.

---

## 1. Frontend: src/App.jsx
```javascript
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Dashboard from "./components/Dashboard";
import Analytics from "./components/Analytics";
import Profile from "./components/Profile";
import History from "./components/History";
import Sidebar from "./components/Sidebar"; 
import AIInsightsPage from "./components/AI/AIInsightsPage"; 
import MonthSummary from "./components/MonthSummary";

import ProtectedLayout from "./components/ProtectedLayout";
import Login from "./components/Login";
import Register from "./components/Register";
import GoogleCallback from "./components/GoogleCallback";
import SetupUsername from "./components/SetupUsername";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem("token") || "");
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const onTokenChanged = (ev) => {
      const newToken = ev?.detail || localStorage.getItem("token") || "";
      setToken(newToken);
    };

    window.addEventListener("auth:token-changed", onTokenChanged);
    return () => window.removeEventListener("auth:token-changed", onTokenChanged);
  }, []);

  const isAuthenticated = !!token;

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/google-callback"
            element={<GoogleCallback setToken={setToken} />}
          />
          <Route
            path="/setup-username"
            element={<SetupUsername setToken={setToken} />}
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <ProtectedLayout token={token} setToken={setToken} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />
            <Route path="history" element={<History />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ai-insights" element={<AIInsightsPage />} />
            <Route path="month-summary" element={<MonthSummary />} />
          </Route>
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
```

---

## 2. Backend: index.js
```javascript
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import fetch from "node-fetch";

import aiRoutes from "./routes/ai.js";
import summaryRoutes from "./routes/summary.js";
import User from "./models/User.js";
import Expense from "./models/Expense.js";
import Otp from "./models/Otp.js";
import { sendOtpEmail } from "./services/mail.js";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = process.env.FRONTEND_ORIGINS.split(",");
      if (!origin || allowed.includes(origin) || allowed.includes("*")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "moneyflow_session",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✔"))
  .catch((err) => console.error("MongoDB Error:", err));

// ... Passport and Google Strat logic omitted for brevity ...

// Health Check
app.get("/api/health", (req, res) => res.json({ status: "ok", service: "moneyflow-backend" }));
app.get("/", (req, res) => res.send("Backend OK ✔"));

app.listen(PORT, "0.0.0.0", () => console.log(`Backend running on http://0.0.0.0:${PORT}`));
```

---

## 3. Backend: Dockerfile
```dockerfile
# Backend Dockerfile for MoneyFlow AI
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]
```

---

## 4. Deployment: ansible/complete-deployment.yml
```yaml
---
# Master Playbook for Complete Money Flow Deployment
- name: "PHASE 1: Install Nginx Web Server"
  import_playbook: playbooks/install-nginx.yml
  tags: ['phase1', 'nginx']

- name: "PHASE 2: Deploy Money Flow Application"
  import_playbook: playbooks/deploy-money-flow.yml
  tags: ['phase2', 'app']

- name: "PHASE 3: Configure Nginx Reverse Proxy"
  import_playbook: playbooks/configure-nginx-proxy.yml
  tags: ['phase3', 'proxy']

- name: "PHASE 4: Deploy Monitoring Stack"
  import_playbook: playbooks/monitoring.yml
  tags: ['phase4', 'monitoring']

- name: Final Verification and Summary
  hosts: webserver
  become: yes
  gather_facts: no
  tasks:
    - name: Check all services status
      systemd:
        name: "{{ item }}"
      register: service_status
      loop:
        - nginx
        - docker
      tags: ['verify']
    - name: Display deployment summary
      debug:
        msg:
          - "✅ DEPLOYMENT COMPLETED SUCCESSFULLY!"
          - "📱 Money Flow App: http://{{ hostvars[inventory_hostname].server_ip | default('<SERVER_IP>') }}"
```
