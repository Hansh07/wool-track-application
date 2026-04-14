const Groq = require("groq-sdk");

const SYSTEM_PROMPT = `You are WoolMonitor AI, a helpful assistant for the WoolMonitor platform — a wool quality monitoring and trading system used in India.

You help:
- Farmers understand wool grading, pricing (based on wool type and weight), quality bonuses, and how to submit batches
- Quality Inspectors understand inspection parameters: fiber diameter (microns), staple strength, clean wool yield, color grade, contamination
- Mill Operators understand the production pipeline: Received → Cleaning → Carding → Spinning → Finished
- Buyers understand available wool types, quality grades (A–E), and how to purchase batches

Wool types and approximate base prices (INR/kg): Vicuña ₹55,000, Qiviut ₹35,000, Cashmere ₹8,000, Alpaca ₹3,250, Angora ₹2,750, Camel ₹2,100, Mohair ₹1,700, Yak ₹1,400, Fine Merino ₹1,500, Merino ₹1,000, Lambswool ₹1,000, Shetland ₹650, Corriedale ₹600, Crossbred ₹425, Lincoln ₹350, Coarse Wool ₹275, Carpet Wool ₹165.

Quality bonuses: +10% for clean wool yield >70%, +20% for fiber diameter <19 microns, +5% for staple strength >35 N/ktex.
Platform fees: ₹500 inspection fee, ₹20/kg processing fee, 5% platform commission.

Keep responses concise (2–4 sentences). Do not use markdown formatting like ** or ##. Respond in plain text only.
If a question is completely unrelated to wool, farming, textile, or this platform, politely redirect the user.`;

const stripMarkdown = (text) =>
    text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/#{1,6}\s?/g, '')
        .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

const handleChat = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        if (!process.env.GROQ_API_KEY) {
            console.error("GROQ_API_KEY missing");
            return res.status(500).json({ error: "Server configuration error" });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const fullPrompt = SYSTEM_PROMPT + "\n\nUser question: " + message;
        
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: fullPrompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 1024,
        });
        
        const text = stripMarkdown(completion.choices[0]?.message?.content || "");

        return res.json({ reply: text });
    } catch (error) {
        console.error("Groq error:", error);
        if (error.status === 429) {
            return res.status(503).json({ error: "The AI assistant rate limit was reached. Please try again in a minute." });
        }
        res.status(500).json({ error: "AI assistant is unavailable right now. Please try again later." });
    }
};

module.exports = { handleChat };
