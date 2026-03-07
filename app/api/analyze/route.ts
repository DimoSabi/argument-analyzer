// Improved AI prompt implementation

import { extractClaims } from './claimExtractor';
import { detectEscalationLevel } from './escalationDetector';
import { calculateDebateHealthScore } from './debateHealthCalculator';

export async function analyzeDebateContent(content) {
    // Step 1: Extract claims from the provided content
    const claims = extractClaims(content);

    // Step 2: Detect escalation level based on claims
    const escalationLevel = detectEscalationLevel(claims);

    // Step 3: Calculate debate health score
    const debateHealthScore = calculateDebateHealthScore(claims);

    // Step 4: Prepare AI prompt
    const improvedPrompt = `Analyzing the following claims: ${JSON.stringify(claims)}\nEscalation Level: ${escalationLevel}\nDebate Health Score: ${debateHealthScore}`;

    return improvedPrompt;
}