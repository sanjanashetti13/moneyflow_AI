import express from "express";
import Summary from "../models/Summary.js";
import Expense from "../models/Expense.js";
import User from "../models/User.js";
import { sendReportEmail } from "../services/mail.js";

const router = express.Router();

/**
 * Checks if previous month summary exists, if not generates it.
 * Triggers Email and UI Notification.
 */
router.get("/check", async (req, res) => {
    const userId = req.user.id;
    const now = new Date();
    
    // Monthly summary for complete previous month
    let targetMonth = now.getMonth() - 1;
    let targetYear = now.getFullYear();
    
    if (targetMonth === -1) {
        targetMonth = 11;
        targetYear -= 1;
    }

    try {
        const existing = await Summary.findOne({ userId, month: targetMonth, year: targetYear });
        if (existing) {
            return res.json({ hasNew: !existing.isRead, summary: existing });
        }

        // Aggregate previous month expenses
        const startOfMonth = new Date(targetYear, targetMonth, 1);
        const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

        const expenses = await Expense.find({ userId, date: { $gte: startOfMonth, $lte: endOfMonth } });
        if (expenses.length === 0) {
            return res.json({ hasNew: false, msg: "No expenses found for previous month" });
        }

        const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
        const categoryBreakdown = {};
        expenses.forEach(e => {
            categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
        });

        // Create the persistent summary
        const newSummary = await Summary.create({
            userId,
            month: targetMonth,
            year: targetYear,
            totalAmount,
            categoryBreakdown,
            isRead: false
        });

        // Send the Monthly Report Email
        const user = await User.findById(userId);
        if (user && user.email) {
            try {
                const monthName = startOfMonth.toLocaleString('default', { month: 'long' });
                await sendReportEmail(user.email, {
                    summary: `Your total spending for ${monthName} ${targetYear} was ₹${totalAmount.toLocaleString()}.`,
                    insights: Object.entries(categoryBreakdown).map(([cat, amt]) => `₹${amt.toLocaleString()} spent on ${cat}`),
                    suggestions: [
                        "Review your highest spending categories in the Analytics section.",
                        "Check your recent insights for personalized savings tips.",
                        "Track your expenses daily for better control."
                    ]
                });
                newSummary.isEmailSent = true;
                await newSummary.save();
            } catch (mailErr) {
                console.error("Failed to send summary email:", mailErr);
            }
        }

        res.json({ hasNew: true, summary: newSummary });
    } catch (error) {
        console.error("Summary Check Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get all previous months summaries
router.get("/all", async (req, res) => {
    try {
        const summaries = await Summary.find({ userId: req.user.id }).sort({ year: -1, month: -1 });
        res.json(summaries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark as read (clears notification)
router.post("/mark-read/:id", async (req, res) => {
    try {
        const summary = await Summary.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true },
            { new: true }
        );
        res.json({ success: true, summary });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
