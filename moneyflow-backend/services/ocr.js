import Tesseract from 'tesseract.js';
import { getChatCompletion } from './openai.js';

/**
 * OCR Helper using Tesseract.js
 */
export const extractTextFromImage = async (imageBuffer) => {
    try {
        const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
        return text;
    } catch (error) {
        console.error("Tesseract OCR Error:", error);
        throw error;
    }
};

/**
 * Receipt Processing: OCR -> LLM Parsing
 */
export const processReceipt = async (imageBuffer) => {
    const rawText = await extractTextFromImage(imageBuffer);
    
    const systemPrompt = `
        You are a receipt parsing expert. 
        Extract the following fields from the raw text provided:
        - Amount (number)
        - Category (one of: Food, Transport, Shopping, Bills, Other)
        - Note (short summary of items)
        - Date (ISO format or current if not found)
        
        Return ONLY a JSON object: { "amount": number, "category": "string", "note": "string", "date": "string" }
    `;

    return getChatCompletion([
        { role: "system", content: systemPrompt },
        { role: "user", content: `Raw Receipt Text: ${rawText}` }
    ]);
};
