import { getFinancialAdvice, getActionableInsights } from "./services/openai.js";
import dotenv from "dotenv";
dotenv.config();

const test = async () => {
    console.log("Testing getFinancialAdvice...");
    try {
        const advice = await getFinancialAdvice("Tell me about my spending", {
            total: 1000,
            categories: { Food: 500, Travel: 500 },
            recent: [],
            currency: "INR"
        });
        console.log("Advice Success:", advice);
    } catch (e) {
        console.error("Advice Failed:", e.message);
    }

    console.log("\nTesting getActionableInsights...");
    try {
        const insights = await getActionableInsights({ 
            expenses: [
                { category: "Food", amount: 100, date: new Date() }
            ] 
        });
        console.log("Insights Success:", insights);
    } catch (e) {
        console.error("Insights Failed:", e.message);
    }
};

test();
