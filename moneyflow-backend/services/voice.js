import fs from 'fs';
import OpenAI from "openai";
import { getChatCompletion } from './openai.js';
import dotenv from "dotenv";

dotenv.config();
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

/**
 * Voice Entry: Audio -> STT -> LLM Parsing
 */
export const processVoiceEntry = async (audioPath) => {
    try {
        // 1. Transcription using Groq (Whisper)
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: "whisper-large-v3",
        });

        const rawText = transcription.text;

        // 2. Parsing into Structured JSON
        const today = new Date().toISOString().split('T')[0];
        const systemPrompt = `
            Convert the following spoken financial entry into a structured expense JSON.
            Today's Date: ${today}
            
            Example: "I spent fifty dollars on dinner today" -> { "amount": 50, "category": "Food", "note": "Dinner", "currency": "USD", "date": "${today}" }
            
            Return ONLY a JSON object: { "amount": number, "category": "Food"|"Transport"|"Shopping"|"Bills"|"Other", "note": "string", "date": "ISO-DATE-STRING", "currency": "string" }
        `;

        const parsed = await getChatCompletion([
            { role: "system", content: systemPrompt },
            { role: "user", content: `Spoken Entry: ${rawText}` }
        ]);

        return { transcription: rawText, parsed };
    } catch (error) {
        console.error("Voice Processing Error:", error);
        throw error;
    }
};
