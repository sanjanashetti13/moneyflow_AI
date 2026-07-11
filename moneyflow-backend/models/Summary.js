import mongoose from "mongoose";

const SummarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: Number, required: true }, // 0-11
  year: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  categoryBreakdown: { type: Object, default: {} },
  isEmailSent: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false }, // For in-app notification status
}, { timestamps: true });

// Prevent duplicate summaries for same month/year/user
SummarySchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("Summary", SummarySchema);
