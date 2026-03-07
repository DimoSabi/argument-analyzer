import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!openaiClient) {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openaiClient;
}

const STRATEGY_INSTRUCTIONS: Record<string, string> = {
    logical: `Focus on logical consistency, evidence quality, and argument clarity. Avoid rhetorical attacks.
Generate a suggested response that strengthens the logical position through evidence and sound reasoning.
Ensure the response is grounded in facts and avoids fallacies.`,

    persuasion: `Focus on psychological persuasion techniques. Use calm, credible language with emotional appeals.
Generate a suggested response that reframes the argument persuasively without appearing aggressive.
Ensure the response builds credibility and resonates emotionally while remaining truthful.`,

    deescalation: `Focus on reducing conflict and maintaining rapport. Acknowledge valid points made by the other side.
Generate a suggested response that defuses tension while addressing the core claim constructively.
Ensure the response is empathetic and seeks common ground.`,

    dominance: `Focus on confident rhetorical control. Challenge the opponent's credibility assertively where warranted.
Generate a suggested response that establishes argumentative dominance through strong, clear framing.
Ensure the response is firm but avoids personal attacks or dishonest tactics.`,

    audience_persuasion: `Focus on convincing observers and lurkers, not the direct opponent.
Generate a suggested response that appeals to spectators' logic and values, making the user's position appear reasonable and well-grounded to the audience.
Ensure the response is clear, measured, and makes the opponent's unreasonable points visible to third parties.`,
};

const STRATEGY_LABELS: Record<string, string> = {
    logical: 'Logical (Evidence & Clarity)',
    persuasion: 'Persuasion (Psychological Framing)',
    deescalation: 'De-escalation (Reduce Conflict)',
    dominance: 'Dominance (Assert Control)',
    audience_persuasion: 'Audience Persuasion (Convince Observers)',
};

function buildSystemPrompt(strategy: string): string {
    const strategyLabel = STRATEGY_LABELS[strategy] ?? strategy;
    const strategyInstructions = STRATEGY_INSTRUCTIONS[strategy] ?? STRATEGY_INSTRUCTIONS.logical;

    return `You are an expert argument analyst and debate coach.
Analyze the provided conversation and return a structured JSON object with the following fields:

- claim_map: object mapping speaker names to arrays of their main claims
- escalation_level: one of "LOW", "MODERATE", or "HIGH"
- debate_health_score: integer 0-100 (100 = perfectly constructive debate)
- ragebait_probability: integer 0-100 (100 = almost certainly designed to provoke)
- logical_issues: array of objects with keys "speaker", "issue", and "description"
- bad_faith_indicators: array of strings describing bad-faith rhetorical moves
- persuasion_tactics: array of strings describing persuasion or framing techniques used
- suggested_response: string containing a single suggested reply aligned with the chosen strategy

RESPONSE STRATEGY: ${strategyLabel}

When generating the suggested_response, follow this strategy:
${strategyInstructions}

Ensure the suggested_response is:
- Aligned with the selected strategy
- Ethically sound (no manipulation, no deception, no personal attacks)
- Effective for the stated goal
- Written in first person as if the user will send it

Return ONLY valid JSON with no markdown code fences or additional text.`;
}

export async function POST(req: NextRequest) {
    try {
        const openai = getOpenAIClient();
        const body = await req.json();
        const { conversation, strategy = 'logical' } = body;

        if (typeof conversation !== 'string' || conversation.trim() === '') {
            return NextResponse.json({ error: 'conversation field must be a non-empty string' }, { status: 400 });
        }

        const validStrategies = Object.keys(STRATEGY_INSTRUCTIONS);
        const resolvedStrategy = validStrategies.includes(strategy) ? strategy : 'logical';

        const systemPrompt = buildSystemPrompt(resolvedStrategy);

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: conversation.trim() },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
        });

        const raw = completion.choices[0]?.message?.content ?? '{}';
        const parsed = JSON.parse(raw);

        return NextResponse.json(parsed);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}