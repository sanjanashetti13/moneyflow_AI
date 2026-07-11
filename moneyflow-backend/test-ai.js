
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

async function testGroq() {
    try {
        console.log("Testing Groq API...");
        console.log("Key:", process.env.GROQ_API_KEY ? "Present" : "MISSING");
        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: "Say hello!" }],
        });
        console.log("Response:", response.choices[0].message.content);
        console.log("Groq Test: SUCCESS ✔");
    } catch (e) {
        console.error("Groq Test: FAILED ❌");
        console.error(e);
    }
}

testGroq();
