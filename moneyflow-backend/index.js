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

// Routes
import aiRoutes from "./routes/ai.js";
import summaryRoutes from "./routes/summary.js";
import User from "./models/User.js";
import Expense from "./models/Expense.js";
import Otp from "./models/Otp.js";
import { sendOtpEmail } from "./services/mail.js";
import {
  resolveGoogleCallbackUrl,
  resolvePublicBackendUrl,
} from "./config/env.js";

const app = express();
const PUBLIC_BACKEND_URL = resolvePublicBackendUrl();
const GOOGLE_CALLBACK_URL = resolveGoogleCallbackUrl();
app.use(express.json());

// ------------------------------
// CORS with Debugging
// ------------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      console.log(`--- CORS REQUEST ---`);
      console.log(`Origin: ${origin}`);
      const allowed = process.env.FRONTEND_ORIGINS.split(",");
      if (!origin || allowed.includes(origin) || allowed.includes("*")) {
        callback(null, true);
      } else {
        console.warn(`CORS BLOCKED: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ------------------------------
// SESSION & PASSPORT
// ------------------------------
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

console.log(`Backend URL: ${PUBLIC_BACKEND_URL}`);
console.log(`Google callback URL: ${GOOGLE_CALLBACK_URL}`);

// ------------------------------
// MONGO CONNECTION
// ------------------------------
async function seedDevAdmin() {
  if (process.env.NODE_ENV === "production") return;

  const email = process.env.DEV_ADMIN_EMAIL;
  const password = process.env.DEV_ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await User.findOne({ email });
  if (existing?.password) return;

  const hashed = await bcrypt.hash(password, 10);
  if (existing) {
    existing.password = hashed;
    existing.username = existing.username || "Admin";
    await existing.save();
  } else {
    await User.create({ email, password: hashed, username: "Admin" });
  }
  console.log(`Dev admin ready: ${email}`);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected ✔");
    try {
      await seedDevAdmin();
    } catch (err) {
      console.error("Dev admin seed error:", err);
    }
  })
  .catch((err) => console.error("MongoDB Error:", err));

// ------------------------------
// GOOGLE STRATEGY
// ------------------------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = await User.create({
            email: profile.emails[0].value,
            username: profile.displayName || "",
            password: "",
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken
          });
        } else {
          user.googleAccessToken = accessToken;
          if (refreshToken) user.googleRefreshToken = refreshToken;
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ------------------------------
// GOOGLE ROUTES
// ------------------------------
app.get(
  "/auth/google",
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    accessType: 'offline',
    prompt: 'consent'
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: process.env.FRONTEND_URL }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, JWT_SECRET, { expiresIn: "7d" });
    const displayName = req.user.username || "";
    const redirectURL = `${process.env.FRONTEND_URL}/google-callback?token=${encodeURIComponent(token)}&email=${encodeURIComponent(req.user.email || "")}&name=${encodeURIComponent(displayName)}&userId=${encodeURIComponent(req.user._id.toString())}`;
    return res.redirect(redirectURL);
  }
);

// ------------------------------
// AUTH MIDDLEWARE
// ------------------------------
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.warn(`AUTH FAILED: No token provided at ${req.path}`);
    return res.status(401).json({ msg: "No token" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
       console.warn(`AUTH FAILED: Invalid token at ${req.path}`, err.message);
       return res.status(401).json({ msg: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

// ------------------------------
// API ROUTES
// ------------------------------
app.post("/api/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email is required" });

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: "Email already registered" });

        // Generate 6-digit OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save or update OTP in DB
        await Otp.findOneAndUpdate(
            { email },
            { code, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        // Send OTP via Email
        await sendOtpEmail(email, code);
        res.json({ msg: "Verification code sent to your email" });
    } catch (err) {
        console.error("Send OTP Error:", err);
        let msg = "Failed to send verification code";
        if (err.message.includes("SMTP_AUTH_FAILED")) {
            msg = "Email server rejected login. You must use a Gmail 'App Password' in your .env settings.";
        }
        res.status(500).json({ msg });
    }
});

app.post("/api/register", async (req, res) => {
  const { email, password, username, otp } = req.body;
  try {
    // Verify OTP first
    const otpRecord = await Otp.findOne({ email, code: otp });
    if (!otpRecord) {
        return res.status(400).json({ msg: "Invalid or expired verification code" });
    }

    // Password Constraint Check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ msg: "Password does not meet security requirements" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed, username: username || "" });
    
    // Clean up OTP after success
    await Otp.deleteOne({ _id: otpRecord._id });
    
    res.json({ msg: "Registered successfully" });
  } catch (e) {
    console.error("Registration Error:", e);
    res.status(400).json({ msg: "Registration failed. Email might already be taken." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "Invalid email or password" });
  if (!user.password) return res.status(400).json({ msg: "Use Google login for this account" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ msg: "Invalid email or password" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user._id, email: user.email, username: user.username } });
});

app.post("/api/set-username", authenticate, async (req, res) => {
  const { username } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { username }, { new: true });
  res.json({ msg: "Username updated", user });
});

app.get("/api/expenses", authenticate, async (req, res) => {
  const data = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
  res.json(data);
});

app.post("/api/expenses", authenticate, async (req, res) => {
  const newExpense = await Expense.create({ ...req.body, userId: req.user.id });
  res.json(newExpense);
});

app.delete("/api/expenses/:id", authenticate, async (req, res) => {
  await Expense.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ msg: "Deleted" });
});

app.get("/api/currency", async (req, res) => {
  try {
    const r = await fetch("https://api.frankfurter.dev/v1/latest?from=INR");
    const data = await r.json();
    res.json(data);
  } catch {
    res.json({ rates: {} });
  }
});

// AI ROUTES
app.use("/api/ai", authenticate, aiRoutes);
app.use("/api/summary", authenticate, summaryRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "moneyflow-backend" }));

app.get("/", (req, res) => res.send("Backend OK ✔"));

app.listen(PORT, "0.0.0.0", () => console.log(`Backend running on http://0.0.0.0:${PORT}`));
  
 
 