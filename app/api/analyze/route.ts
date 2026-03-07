import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not configured');
  }
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

const SYSTEM_PROMPT = `You are a professional argument structure analyzer. Your role is to analyze conversations and debates with precision and neutrality.

IMPORTANT ETHICAL GUIDELINES:
- Never say "Speaker A is wrong" or take emotional sides. Instead say "this reasoning lacks supporting evidence".
- Focus on argument quality, not person quality.
- Use "reasoning strength estimate" rather than declaring a winner.
- Be analytical and neutral at all times.

Analyze the conversation provided and return a JSON object with EXACTLY this structure:

{
  "claim_map": {
    "Speaker A": ["claim 1", "claim 2"],
    "Speaker B": ["claim 1", "claim 2"]
  },
  "escalation_level": "LOW" | "MODERATE" | "HIGH",
  "escalation_indicators": ["indicator 1", "indicator 2"],
  "debate_health_score": <integer 0-100>,
  "debate_health_factors": {
    "evidence_quality": "<brief description>",
    "respectful_engagement": "<brief description>",
    "logical_structure": "<brief description>",
    "topic_focus": "<brief description>"
  },
  "argument_strength": {
    "Speaker A": <integer 0-100>,
    "Speaker B": <integer 0-100>
  },
  "logical_issues": [
    { "speaker": "Speaker A", "issue": "<fallacy name>", "description": "<neutral explanation>" }
  ],
  "bad_faith_indicators": [
    { "speaker": "Speaker A", "indicator": "<indicator>", "description": "<neutral explanation>" }
  ],
  "ragebait_probability": <integer 0-100>,
  "ragebait_indicators": ["indicator 1", "indicator 2"],
  "persuasion_tactics": [
    { "speaker": "Speaker A", "tactic": "<tactic name>", "description": "<neutral explanation>" }
  ],
  "suggested_responses": ["response 1", "response 2", "response 3"]
}

CLAIM MAP INSTRUCTIONS:
- Identify each distinct speaker (use "Speaker A", "Speaker B", etc. or real names if present).
- List each factual or opinion claim they make as a bullet point.

ESCALATION LEVEL CRITERIA:
- LOW: civil discussion, focused on ideas
- MODERATE: some emotional language, minor personal remarks
- HIGH: personal attacks, hostile tone, repeated rebuttal cycles

DEBATE HEALTH SCORE (0-100):
- 0-30: unproductive argument (name-calling, no evidence, off-topic)
- 30-70: mixed reasoning (some logic, some fallacies)
- 70-100: constructive debate (evidence-backed, respectful, focused)

RAGEBAIT DETECTION INDICATORS:
- Strawman representations
- Provocative generalizations
- Emotional manipulation language
- Deliberate misquoting

Return ONLY valid JSON. No markdown code blocks, no extra text.`;

export async function POST(req: NextRequest) {
  try {
    const { conversation } = await req.json();

    if (!conversation || typeof conversation !== 'string' || conversation.trim().length === 0) {
      return NextResponse.json({ error: 'conversation text is required' }, { status: 400 });
    }

    const client = getClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: conversation.trim() },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const analysis = JSON.parse(raw);

    return NextResponse.json(analysis);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}