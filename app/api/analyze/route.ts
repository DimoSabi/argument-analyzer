import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const { conversation, strategy } = await req.json();
        if (!conversation) {
            return NextResponse.json({ error: "conversation is required" }, { status: 400 });
        }

        const prompt = `You are an argument analysis engine. Analyze the following conversation${strategy ? ` using a "${strategy}" strategy` : ""}. Conversation: ${conversation} Return JSON with these fields: - claim_map: array of claims made by each party - logical_issues: array of logical fallacies or issues detected - persuasion_tactics: array of persuasion tactics identified - debate_tactics_detected: array of debate tactics used - bad_faith_indicators: array of bad-faith indicators found - ragebait_probability: number between 0 and 1 - escalation_level: string (low / medium / high) - debate_health_score: number between 0 and 100 - suggested_response: string with a suggested response Respond with only valid JSON.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.2,
            messages: [
                { role: "system", content: "You analyze debates logically. Always respond with valid JSON only." },
                { role: "user", content: prompt }
            ]
        });

        const content = completion.choices[0].message.content ?? "{}";
        let parsed: unknown;
        try {
            parsed = JSON.parse(content);
        } catch {
            parsed = { raw: content };
        }

        return NextResponse.json({ result: parsed });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}