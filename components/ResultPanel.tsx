import React, { useState } from 'react';
import './ResultPanel.css';

interface LogicalIssue {
    speaker: string;
    issue: string;
    description: string;
}

interface AnalysisResult {
    claim_map?: Record<string, string[]>;
    escalation_level?: string;
    debate_health_score?: number;
    ragebait_probability?: number;
    logical_issues?: LogicalIssue[];
    bad_faith_indicators?: string[];
    persuasion_tactics?: string[];
    suggested_response?: string;
}

interface ResultPanelProps {
    result: AnalysisResult;
    strategy: string;
}

const STRATEGY_LABELS: Record<string, string> = {
    logical: 'Logical (Evidence & Clarity)',
    persuasion: 'Persuasion (Psychological Framing)',
    deescalation: 'De-escalation (Reduce Conflict)',
    dominance: 'Dominance (Assert Control)',
    audience_persuasion: 'Audience Persuasion (Convince Observers)',
};

const ResultPanel = ({ result, strategy }: ResultPanelProps) => {
    const [copied, setCopied] = useState(false);

    const strategyLabel = STRATEGY_LABELS[strategy] ?? strategy;

    const handleCopy = () => {
        const text = JSON.stringify(result, null, 2);
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="result-panel">
            <div className="strategy-banner">
                <span>📋 Response Strategy: {strategyLabel}</span>
            </div>

            {result.claim_map && (
                <div className="card claim-map">
                    <h3>Claim Map</h3>
                    {Object.entries(result.claim_map).map(([speaker, claims]) => (
                        <div key={speaker}>
                            <strong>{speaker}:</strong>
                            <ul>
                                {claims.map((claim, i) => (
                                    <li key={i}>{claim}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            <div className="card-row">
                {result.escalation_level !== undefined && (
                    <div className="card escalation-level">
                        <h3>Escalation Level</h3>
                        <p className={`escalation-badge escalation-${result.escalation_level?.toLowerCase()}`}>
                            {result.escalation_level}
                        </p>
                    </div>
                )}
                {result.debate_health_score !== undefined && (
                    <div className="card debate-health-score">
                        <h3>Debate Health Score</h3>
                        <p className="score">{result.debate_health_score} / 100</p>
                    </div>
                )}
                {result.ragebait_probability !== undefined && (
                    <div className="card ragebait-probability">
                        <h3>Ragebait Probability</h3>
                        <p className="score">{result.ragebait_probability}%</p>
                    </div>
                )}
            </div>

            {result.logical_issues && result.logical_issues.length > 0 && (
                <div className="card logical-issues">
                    <h3>Logical Issues</h3>
                    <ul>
                        {result.logical_issues.map((issue, i) => (
                            <li key={i}>
                                <strong>{issue.speaker}</strong> — {issue.issue}: {issue.description}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {result.bad_faith_indicators && result.bad_faith_indicators.length > 0 && (
                <div className="card">
                    <h3>Bad Faith Indicators</h3>
                    <ul>
                        {result.bad_faith_indicators.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}

            {result.persuasion_tactics && result.persuasion_tactics.length > 0 && (
                <div className="card">
                    <h3>Persuasion Tactics</h3>
                    <ul>
                        {result.persuasion_tactics.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}

            {result.suggested_response && (
                <div className="card suggested-response">
                    <h3>💡 Suggested Response</h3>
                    <blockquote>{result.suggested_response}</blockquote>
                </div>
            )}

            <button className="copy-button" onClick={handleCopy}>
                {copied ? '✅ Copied!' : '📋 Copy Results'}
            </button>
        </div>
    );
};

export default ResultPanel;
