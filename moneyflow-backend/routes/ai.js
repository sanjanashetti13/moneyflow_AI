import express from "express";
import { getFinancialAdvice, getActionableInsights, getChatCompletion } from "../services/openai.js";
import { sendReportEmail } from "../services/mail.js";
import { processReceipt } from "../services/ocr.js";
import { processVoiceEntry } from "../services/voice.js";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";

import User from "../models/User.js";
import Expense from "../models/Expense.js";

const router = express.Router();

// Setup Multer for temp storage
const upload = multer({ dest: "uploads/" });

/**
 * POST /api/ai/chat
 */
router.post("/chat", async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id;
    
    console.log(`--- AI CHAT REQUEST ---`);
    console.log(`User ID: ${userId}`);
    console.log(`Message: ${message}`);

    try {
        const user = await User.findById(userId);
        const expenses = await Expense.find({ userId }).sort({ date: -1 }).limit(50);
        
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        const categories = {};
        expenses.forEach(e => {
            categories[e.category] = (categories[e.category] || 0) + e.amount;
        });

        const advice = await getFinancialAdvice(message, {
            total,
            categories,
            recent: expenses.slice(0, 10),
            currency: user.base_currency || "INR"
        });

        res.json(advice);
    } catch (error) {
        console.error("AI Chat Route Error:", error);
        res.status(500).json({ msg: "AI Chat failed", error: error.message });
    }
});

/**
 * GET /api/ai/insights
 */
router.get("/insights", async (req, res) => {
    const userId = req.user.id;
    try {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        let expenses = await Expense.find({ 
            userId, 
            date: { $gte: last30Days } 
        }).sort({ date: -1 });

        // Fallback: if no recent expenses, get the latest 20 anyway
        if (expenses.length === 0) {
            expenses = await Expense.find({ userId }).sort({ date: -1 }).limit(20);
        }

        // Aggregate data for the AI
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        
        const categoryData = {};
        expenses.forEach(e => {
            categoryData[e.category] = (categoryData[e.category] || 0) + e.amount;
        });

        // Weekly comparison (simplified)
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const thisWeek = expenses.filter(e => new Date(e.date) >= oneWeekAgo);
        const lastWeek = expenses.filter(e => new Date(e.date) >= twoWeeksAgo && new Date(e.date) < oneWeekAgo);

        const thisWeekTotal = thisWeek.reduce((sum, e) => sum + e.amount, 0);
        const lastWeekTotal = lastWeek.reduce((sum, e) => sum + e.amount, 0);

        const insights = await getActionableInsights({ 
            total,
            categoryData,
            transactions: expenses.slice(0, 10).map(e => `${new Date(e.date).toISOString().split('T')[0]}: ${e.amount} on ${e.category} (${e.note || 'No note'})`),
            thisWeekTotal,
            lastWeekTotal,
            currency: "₹" // Assuming INR as requested in prompt format
        });
        res.json(insights);
    } catch (error) {
        console.error("AI Insights Route Error:", error);
        res.status(500).json({ msg: "AI Insights failed", error: error.message });
    }
});


/**
 * POST /api/ai/voice
 * Uploads audio and processes it into an expense
 */
router.post("/voice", upload.single("voice"), async (req, res) => {
    const userId = req.user.id;
    if (!req.file) return res.status(400).json({ msg: "No audio file provided" });

    console.log(`--- VOICE ENTRY REQUEST ---`);
    console.log(`User ID: ${userId}`);
    console.log(`File: ${req.file.path}`);

    try {
        // 1. Rename to include extension (Groq API needs it)
        const ext = path.extname(req.file.originalname) || ".webm";
        const newPath = req.file.path + ext;
        fs.renameSync(req.file.path, newPath);

        // 2. Process voice using Groq service
        const data = await processVoiceEntry(newPath);
        
        // 3. Clean up temp file
        if (fs.existsSync(newPath)) fs.unlinkSync(newPath);

        res.json(data);
    } catch (error) {
        console.error("Voice Route Error:", error);
        // Clean up both possible paths on error
        const ext = path.extname(req.file.originalname) || ".webm";
        const newPath = req.file.path + ext;
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
        res.status(500).json({ msg: "Voice processing failed", error: error.message });
    }
});


export default router;
