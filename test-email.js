import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

// Load .env from backend folder
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "moneyflow-backend", ".env") });

async function testEmail() {
    console.log("--- SMTP DEBUG TEST ---");
    console.log("Host:", process.env.SMTP_HOST);
    console.log("Port:", process.env.SMTP_PORT);
    console.log("User:", process.env.SMTP_USER);
    console.log("Pass Length:", process.env.SMTP_PASS?.length || 0);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT == "465",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        console.log("Verifying connection...");
        await transporter.verify();
        console.log("✔ SMTP Connection OK!");

        console.log("Sending test email...");
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER,
            subject: "MoneyFlow SMTP Test",
            text: "If you see this, your SMTP settings are CORRECT!"
        });
        console.log("✔ Test email SENT successfully!");
    } catch (err) {
        console.error("✖ SMTP TEST FAILED:");
        console.error(err.message);
        if (err.message.includes("5.7.8")) {
            console.log("\n💡 SUGGESTION: This error means your password was rejected.");
            console.log("Since you are using Gmail, you MUST use an 'App Password', not your regular login password.");
        }
    }
}

testEmail();
