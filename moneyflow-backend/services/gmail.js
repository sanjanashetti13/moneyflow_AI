import { google } from 'googleapis';
import { getChatCompletion } from './openai.js';
import he from 'he';
import { resolveGoogleCallbackUrl } from '../config/env.js';

/**
 * Gmail Subscription Parser
 */
export const syncSubscriptionsFromGmail = async (accessToken, refreshToken) => {
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        resolveGoogleCallbackUrl()
    );
    auth.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

    const gmail = google.gmail({ version: 'v1', auth });

    try {
        // 1. Search for subscription/billing emails from common services
        const query = 'subject:(subscription OR billing OR invoice OR "payment received" OR renew) (Netflix OR Amazon OR Google OR Spotify OR YouTube OR iCloud OR Microsoft OR Adobe)';
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 15
        });

        if (!response.data.messages) return [];

        const pendingSubscriptions = [];

        // 2. Fetch and Parse snippets/bodies
        for (const msg of response.data.messages) {
            const detail = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'full'
            });

            const snippet = detail.data.snippet;
            const payload = detail.data.payload;
            let body = '';

            // Extract body (simplified)
            if (payload.parts) {
                const part = payload.parts.find(p => p.mimeType === 'text/plain') || payload.parts[0];
                if (part.body.data) {
                    body = Buffer.from(part.body.data, 'base64').toString();
                }
            } else if (payload.body.data) {
                body = Buffer.from(payload.body.data, 'base64').toString();
            }

            // Clean body
            const cleanBody = he.decode(body.replace(/<[^>]*>/g, ' ')).substring(0, 2000);

            // 3. AI Parsing
            const systemPrompt = `
                Extract subscription details from this email text.
                Identify: Service Name, Amount, Currency, Frequency (Monthly/Yearly/Weekly), and Category.
                Return ONLY a JSON array of objects: [{ "name": "string", "amount": number, "currency": "string", "frequency": "string", "category": "string" }]
                If no subscription is found, return [].
            `;

            const parsed = await getChatCompletion([
                { role: "system", content: systemPrompt },
                { role: "user", content: `Email Snippet: ${snippet}\n\nEmail Body: ${cleanBody}` }
            ]);

            if (Array.isArray(parsed) && parsed.length > 0) {
                pendingSubscriptions.push(...parsed);
            }
        }

        // Deduplicate by name and amount
        const unique = [];
        const seen = new Set();
        for (const sub of pendingSubscriptions) {
            const key = `${sub.name}-${sub.amount}`;
            if (!seen.has(key)) {
                unique.push(sub);
                seen.has(key);
                seen.add(key);
            }
        }

        return unique;
    } catch (error) {
        console.error("--- GMAIL SYNC ERROR DETAIL ---");
        console.error("Message:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data));
        }
        console.error("-------------------------------");
        throw error;
    }
};
