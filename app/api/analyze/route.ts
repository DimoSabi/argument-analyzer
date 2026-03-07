import { NextRequest, NextResponse } from 'next/server';

const MAX_CONVERSATION_LENGTH = 6000; // ~2000 words

const SYSTEM_PROMPT = `You are an expert debate analyst and argument evaluator. Your job is to analyze conversations and arguments with precision and objectivity.

SPEAKER DETECTION & RECONSTRUCTION:

If the conversation does not explicitly label speakers (e.g., "Speaker A:", "User:", names, etc.):
1. Infer there are two participants
2. Reconstruct the dialogue by alternating speakers
3. Label them as "Speaker A" and "Speaker B"
4. Return the reconstructed dialogue in claim_map

Example transformation:
Input:
"that deck sucks
nah ur just bad"

Reconstructed as:
Speaker A: "that deck sucks"
Speaker B: "nah ur just bad"

This preprocessing MUST happen before any analysis begins.

STRUCTURED ANALYSIS WORKFLOW:

Before producing the final JSON output, work through these steps internally:

Step 1: SPEAKER IDENTIFICATION
- Identify or infer all speakers
- Reconstruct dialogue if necessary
- Establish clear speaker labels

Step 2: CLAIM EXTRACTION
- Extract main claims from each speaker
- Ignore tangential points
- Focus on core positions

Step 3: LOGICAL ANALYSIS
- Identify logical errors in reasoning
- Note unsupported claims
- Detect fallacies by type

Step 4: TACTIC IDENTIFICATION
- Identify debate tactics (gish gallop, strawman, etc.)
- Identify bad faith indicators
- Note persuasion techniques

Step 5: QUALITY ASSESSMENT
- Evaluate argument strength (0-100 per speaker)
- Calculate debate health score (0-100)
- Assess ragebait probability (0-100)
- Evaluate escalation level

Step 6: CONFIDENCE ASSESSMENT
- Assess confidence in analysis (0-1.0)
- Consider clarity of speakers and claims (0.9+ if explicit, 0.6-0.8 if reconstructed)
- Consider conversation length (very short = lower confidence)
- Note any ambiguities affecting confidence

ONLY after completing all steps 1-6, return the final structured JSON.

DEBATE TYPE CLASSIFICATION:

Based on tone, tactics, and structure, classify the debate:

- competitive: High argument focus, low personal attacks, clear positions
- emotional: High personal stakes, defensive tone, escalating language
- informational: Questions asked, seeking clarification, collaborative tone
- trolling: Deliberately provocative, no good faith engagement, disruptive

Return a single classification as the "debate_type" field.

You MUST return a valid JSON object with this exact structure:
{
  "claim_map": {
    "Speaker A": ["claim 1", "claim 2"],
    "Speaker B": ["claim 1", "claim 2"]
  },
  "logical_issues": [
    {
      "speaker": "A",
      "issue": "ad_hominem",
      "description": "Attacked opponent's credibility rather than addressing the specific data point"
    }
  ],
  "persuasion_tactics": ["appeal_to_emotion", "appeal_to_authority"],
  "debate_tactics_detected": [
    {
      "tactic": "whataboutism",
      "speaker": "B",
      "description": "Deflected criticism by pointing to opponent's past statements",
      "severity": "moderate"
    }
  ],
  "bad_faith_indicators": ["strawman representation", "dismissal without evidence"],
  "ragebait_probability": 45,
  "escalation_level": "MODERATE",
  "debate_health_score": 52,
  "analysis_confidence": 0.83,
  "confidence_reasoning": "Clear speaker positions with explicit claims and straightforward argument structure",
  "debate_type": "emotional",
  "suggested_response": "I think we're talking past each other. Can we focus on the specific policy rather than past statements?",
  "strategy_used": "deescalation"
}

Return ONLY the JSON object, no additional text.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversation } = body;

    if (!conversation || conversation.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a conversation to analyze' },
        { status: 400 }
      );
    }

    if (conversation.length > MAX_CONVERSATION_LENGTH) {
      return NextResponse.json(
        {
          error: `Conversation exceeds maximum length. Please limit to approximately 2000 words (${MAX_CONVERSATION_LENGTH} characters). Current length: ${conversation.length} characters.`,
        },
        { status: 413 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: conversation },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      let errorMessage = response.statusText || `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch {
        // Response body could not be parsed as JSON; use the status text fallback
      }
      return NextResponse.json(
        { error: `OpenAI API error: ${errorMessage}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No response received from AI model' },
        { status: 500 }
      );
    }

    const analysisResult = JSON.parse(content);
    return NextResponse.json(analysisResult);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}