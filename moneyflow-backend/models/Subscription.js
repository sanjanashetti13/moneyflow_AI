import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  frequency: { type: String, enum: ["Monthly", "Yearly", "Weekly", "One-time"], default: "Monthly" },
  category: { type: String, default: "Subscription" },
  nextPayment: { type: Date },
  lastSynced: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Subscription", SubscriptionSchema);
