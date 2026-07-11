import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
    username: { type: String, default: "" },
    base_currency: { type: String, default: "INR" },
    googleAccessToken: String,
    googleRefreshToken: String,
});

export default mongoose.model("User", userSchema);
