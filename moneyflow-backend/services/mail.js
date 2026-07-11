import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS?.replace(/[^a-zA-Z0-9]/g, ""), // STRIP EVERYTHING BUT LETTERS/NUMBERS
    },
});

export const sendReportEmail = async (to, reportData) => {
    try {
        const info = await transporter.sendMail({
            from: `"MoneyFlow AI" <${process.env.SMTP_USER}>`,
            to,
            subject: "Your Monthly Financial Assistant Report",
            text: `Monthly Summary: ${reportData.summary}`,
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h1 style="color: #10b981;">MoneyFlow Monthly Report</h1>
                    <p>${reportData.summary}</p>
                    <h2 style="color: #10b981;">Key Insights</h2>
                    <ul>
                        ${reportData.insights.map(i => `<li>${i}</li>`).join('')}
                    </ul>
                    <h2 style="color: #10b981;">Suggestions</h2>
                    <ul>
                        ${reportData.suggestions.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
            `,
        });
        console.log("Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Nodemailer Error:", error);
        throw error;
    }
};

export const sendOtpEmail = async (to, otp) => {
    try {
        const info = await transporter.sendMail({
            from: `"MoneyFlow AI" <${process.env.SMTP_USER}>`,
            to,
            subject: "Your MoneyFlow Verification Code",
            text: `Your verification code is: ${otp}`,
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h1 style="color: #10b981; text-align: center;">MoneyFlow AI</h1>
                    <p style="text-align: center; color: #666;">Use the code below to verify your email address and complete your signup.</p>
                    <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111;">${otp}</span>
                    </div>
                    <p style="font-size: 12px; color: #999; text-align: center;">This code will expire in 5 minutes. If you didn't request this, you can safely ignore this email.</p>
                </div>
            `,
        });
        console.log("OTP Sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("OTP Email Error:", error);
        // Throw a specific error if it's an auth failure
        if (error.message.includes("535") || error.message.includes("Invalid login")) {
            throw new Error("SMTP_AUTH_FAILED: Invalid login. Check your App Password.");
        }
        throw error;
    }
};
