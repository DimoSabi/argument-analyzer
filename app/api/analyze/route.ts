import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an expert debate analyst and argumentation coach. Analyze the conversation provided and return a JSON object with the following structure:

{
  "claim_map": {
    "<Speaker Name>": ["claim 1", "claim 2"]
  },
  "logical_issues": [
    {
      "speaker": "<Speaker Name>",
      "issue": "<issue type>",
      "description": "<explanation>"
    }
  ],
  "persuasion_tactics": ["<tactic description>"],
  "debate_tactics_detected": [
    {
      "tactic": "<tactic name>",
      "speaker": "<Speaker Name>",
      "description": "<explanation of how this tactic was used>",
      "severity": "<minor|moderate|severe>"
    }
  ],
  "bad_faith_indicators": ["<indicator description>"],
  "ragebait_probability": <0-100>,
  "escalation_level": "<LOW|MODERATE|HIGH|EXTREME>",
  "debate_health_score": <0-100>,
  "suggested_response": "<response text>"
}

DEBATE TACTICS DETECTION:
When analyzing the conversation, identify any use of these tactics:
- Gish Gallop: Overwhelming with many arguments without proper evidence
- Motte and Bailey: Strong claim → retreats to weaker claim when challenged
- Sealioning: Persistent "innocent" questions to exhaust or appear reasonable
- Whataboutism: Deflecting criticism with unrelated counter-criticism
- Ad Hominem: Attacking the person instead of the argument
- Strawman: Misrepresenting opponent's position

For each detected tactic:
- Name it (use snake_case: gish_gallop, motte_and_bailey, sealioning, whataboutism, ad_hominem, strawman)
- Identify the speaker
- Explain why it fits the definition
- Rate severity: minor/moderate/severe

INTERNAL CRITIQUE RESPONSE (for dominance strategy only):
When the requested strategy is "dominance", generate a suggested_response using internal critique:
1. Identify the opponent's main premise clearly
2. Temporarily accept the premise (don't attack it directly)
3. Follow the logic to show where it contradicts their conclusion
4. Expose the inconsistency
This approach avoids insults, exposes reasoning contradictions, and forces the opponent to either accept the inconsistency or revise their position.

SCORING GUIDELINES:
- debate_health_score: 0-100 (100 = perfectly civil and logical, 0 = completely toxic and irrational)
- ragebait_probability: 0-100 (likelihood content is designed to provoke emotional reactions)
- escalation_level: LOW (calm discussion), MODERATE (some tension), HIGH (strong conflict), EXTREME (hostile)

ETHICAL SAFEGUARDS:
- Never generate actual insults or personal attacks in suggested_response
- Focus on logical analysis and constructive responses
- Strategy-aligned responses: logical (pure logic), persuasion (rhetorical), deescalation (calm), dominance (internal critique), audience_persuasion (appeal to observers)

Return ONLY valid JSON, no additional text.`;

export async function POST(req: NextRequest) {
  try {
    const { conversation, strategy = 'logical' } = await req.json();

    if (!conversation || typeof conversation !== 'string') {
      return NextResponse.json(
        { error: 'conversation field is required and must be a string' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Analyze this conversation using strategy: "${strategy}"\n\n${conversation}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      return NextResponse.json(
        { error: 'OpenAI API error', details: errorData },
        { status: openaiResponse.status }
      );
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    let analysisResult: unknown;
    try {
      analysisResult = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse analysis result from OpenAI' },
        { status: 500 }
      );
    }

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}