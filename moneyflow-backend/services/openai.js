import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

/**
 * Common Chat LLM Interaction
 */
export const getChatCompletion = async (messages, model = "llama-3.3-70b-versatile") => {
    try {
        const response = await openai.chat.completions.create({
            model,
            messages,
        });
        
        const rawContent = response.choices[0].message.content;
        console.log("--- RAW AI RESPONSE ---");
        console.log(rawContent);
        console.log("-----------------------");

        let content = rawContent;
        
        // Robust JSON extraction (supports {} and [])
        const jsonMatch = content.match(/[{\[][\s\S]*[}\]]/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0].trim());
            } catch (pErr) {
                console.warn("JSON Parse Error, falling back to raw content:", pErr.message);
            }
        }
        
        // Fallback for chat-like responses that aren't JSON
        return { reply: rawContent };
    } catch (error) {
        console.error("Groq/AI Chat Completion Error:", error);
        throw error;
    }
};

/**
 * Financial Advisor Chat Helper
 */
export const getFinancialAdvice = async (userQuery, userData) => {
    const systemPrompt = `
        You are MoneyFlowAI, a highly professional and empathetic financial advisor.
        You have access to the user's recent financial data:
        - Total Expenses: ${userData.total}
        - Categories: ${JSON.stringify(userData.categories)}
        - Recent Transactions: ${JSON.stringify(userData.recent)}
        
        Rules:
        1. Be concise, actionable, and professional.
        2. Use the user's base currency (${userData.currency}).
        3. Provide specific insights based on their data.
        4. If the user asks general questions, still try to relate them to their spending.
        
        Return a JSON object: { "reply": "string" }
    `;

    return getChatCompletion([
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery }
    ]);
};

/**
 * Insights Generator Helper
 */
export const getActionableInsights = async (userData) => {
    const systemPrompt = `
        You are a smart financial analyst.
        Analyze the user's expense data and generate 5 HIGHLY PERSONALIZED insights.

        IMPORTANT RULES:
        - Use actual numbers, percentages, and comparisons.
        - Mention categories (Food, Transport, Shopping, etc.).
        - Compare with previous periods (last week vs this week).
        - Identify overspending patterns.
        - Give actionable suggestions (not generic advice).
        - Make each insight specific and human-like.
        - Keep each insight under 2 lines.

        USER DATA:
        Total Spend: ${userData.currency}${userData.total}
        Category Breakdown:
        ${JSON.stringify(userData.categoryData, null, 2)}

        Recent Transactions:
        ${userData.transactions.join('\n')}

        This week total: ${userData.currency}${userData.thisWeekTotal}
        Last week total: ${userData.currency}${userData.lastWeekTotal}

        OUTPUT FORMAT:
        { "insights": [
          { "title": "Food Budget Spike", "content": "You spent 42% more on Food this week..." },
          { "title": "Transport Habit", "content": "..." }
        ]}
    `;

    const result = await getChatCompletion([
        { role: "system", content: systemPrompt },
        { role: "user", content: "Analyze my data and give me 5 personalized insights." }
    ]);

    // Normalize response: if it's an array, wrap it in { insights: [...] }
    if (Array.isArray(result)) {
        return { insights: result };
    }
    return result;
};
