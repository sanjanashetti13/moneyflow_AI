import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

async function testEmail() {
    console.log("--- SMTP DEBUG TEST ---");
    console.log("Host:", process.env.SMTP_HOST);
    console.log("Port:", process.env.SMTP_PORT);
    console.log("User:", process.env.SMTP_USER);
    const finalPass = process.env.SMTP_PASS?.replace(/[^a-zA-Z0-9]/g, ""); // STRIP EVERYTHING BUT LETTERS/NUMBERS
    console.log("Transformed Pass Length:", finalPass?.length || 0);
    if (finalPass) {
        console.log("Pass starts with:", finalPass.substring(0, 2) + "...");
        console.log("Pass ends with:", "..." + finalPass.substring(finalPass.length - 2));
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: finalPass,
        },
    });

    try {
        console.log("Verifying connection to SMTP server...");
        await transporter.verify();
        console.log("✔ SMTP Connection OK!");

        console.log("Sending test email to yourself...");
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
        
        if (err.message.includes("5.7.8") || err.message.includes("Username and Password not accepted")) {
            console.log("\n💡 SOLUTION: Your regular Gmail password was rejected.");
            console.log("You MUST use a Google 'App Password'.");
            console.log("Steps: Google Account -> Security -> 2-Step Verification -> App Passwords.");
        }
    }
}

testEmail();
