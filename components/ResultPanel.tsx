import React from 'react';
import './ResultPanel.css';

const HEALTH_THRESHOLD_LOW = 30;
const HEALTH_THRESHOLD_HIGH = 70;

const ESCALATION_CLASS_MAP: Record<string, string> = {
    HIGH: 'escalation-high',
    MODERATE: 'escalation-moderate',
    LOW: 'escalation-low',
};

interface LogicalIssue {
    speaker: string;
    issue: string;
    description: string;
}

interface BadFaithIndicator {
    speaker: string;
    indicator: string;
    description: string;
}

interface PersuasionTactic {
    speaker: string;
    tactic: string;
    description: string;
}

interface AnalysisResult {
    claim_map?: Record<string, string[]>;
    escalation_level?: 'LOW' | 'MODERATE' | 'HIGH';
    escalation_indicators?: string[];
    debate_health_score?: number;
    debate_health_factors?: {
        evidence_quality?: string;
        respectful_engagement?: string;
        logical_structure?: string;
        topic_focus?: string;
    };
    argument_strength?: Record<string, number>;
    logical_issues?: LogicalIssue[];
    bad_faith_indicators?: BadFaithIndicator[];
    ragebait_probability?: number;
    ragebait_indicators?: string[];
    persuasion_tactics?: PersuasionTactic[];
    suggested_responses?: string[];
}

interface ResultPanelProps {
    result: AnalysisResult;
}

function escalationClass(level?: string) {
    return ESCALATION_CLASS_MAP[level ?? ''] ?? 'escalation-low';
}

function healthLabel(score?: number) {
    if (score === undefined) return '';
    if (score < HEALTH_THRESHOLD_LOW) return 'Unproductive argument';
    if (score < HEALTH_THRESHOLD_HIGH) return 'Mixed reasoning';
    return 'Constructive debate';
}

function healthClass(score?: number) {
    if (score === undefined) return '';
    if (score < HEALTH_THRESHOLD_LOW) return 'health-low';
    if (score < HEALTH_THRESHOLD_HIGH) return 'health-mid';
    return 'health-high';
}

const ResultPanel = ({ result }: ResultPanelProps) => {
    return (
        <div className="result-panel">

            {/* CLAIM MAP */}
            {result.claim_map && Object.keys(result.claim_map).length > 0 && (
                <div className="card claim-map">
                    <h3 className="card-title">🗺️ Claim Map</h3>
                    {Object.entries(result.claim_map).map(([speaker, claims]) => (
                        <div key={speaker} className="speaker-block">
                            <h4 className="speaker-name">{speaker}</h4>
                            <ul>
                                {claims.map((claim, i) => (
                                    <li key={i}>{claim}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* ARGUMENT STRENGTH */}
            {result.argument_strength && Object.keys(result.argument_strength).length > 0 && (
                <div className="card argument-strength">
                    <h3 className="card-title">💪 Argument Strength</h3>
                    {Object.entries(result.argument_strength).map(([speaker, score]) => (
                        <div key={speaker} className="strength-row">
                            <span className="strength-label">{speaker}</span>
                            <div className="strength-bar-bg">
                                <div
                                    className="strength-bar-fill"
                                    style={{ width: `${score}%` }}
                                />
                            </div>
                            <span className="strength-score">{score}/100</span>
                        </div>
                    ))}
                    <p className="card-note">Reasoning strength estimate — not a declaration of who is right.</p>
                </div>
            )}

            {/* LOGICAL ISSUES */}
            {result.logical_issues && result.logical_issues.length > 0 && (
                <div className="card logical-issues">
                    <h3 className="card-title">🔍 Logical Issues</h3>
                    <ul>
                        {result.logical_issues.map((item, i) => (
                            <li key={i}>
                                <span className="tag">{item.speaker}</span>
                                <strong> {item.issue}</strong>
                                {item.description && <span> — {item.description}</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* BAD FAITH INDICATORS */}
            {result.bad_faith_indicators && result.bad_faith_indicators.length > 0 && (
                <div className="card bad-faith">
                    <h3 className="card-title">⚠️ Bad Faith Indicators</h3>
                    <ul>
                        {result.bad_faith_indicators.map((item, i) => (
                            <li key={i}>
                                <span className="tag">{item.speaker}</span>
                                <strong> {item.indicator}</strong>
                                {item.description && <span> — {item.description}</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* RAGEBAIT PROBABILITY */}
            {result.ragebait_probability !== undefined && (
                <div className="card ragebait-probability">
                    <h3 className="card-title">🔥 Ragebait Probability</h3>
                    <div className="score-display">
                        <span className="score-number">{result.ragebait_probability}</span>
                        <span className="score-unit">/100</span>
                    </div>
                    {result.ragebait_indicators && result.ragebait_indicators.length > 0 && (
                        <>
                            <h4>Indicators:</h4>
                            <ul>
                                {result.ragebait_indicators.map((ind, i) => (
                                    <li key={i}>{ind}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}

            {/* ESCALATION LEVEL */}
            {result.escalation_level && (
                <div className="card escalation-level">
                    <h3 className="card-title">📈 Escalation Level</h3>
                    <span className={`escalation-badge ${escalationClass(result.escalation_level)}`}>
                        {result.escalation_level}
                    </span>
                    {result.escalation_indicators && result.escalation_indicators.length > 0 && (
                        <>
                            <h4>Indicators:</h4>
                            <ul>
                                {result.escalation_indicators.map((ind, i) => (
                                    <li key={i}>{ind}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}

            {/* DEBATE HEALTH SCORE */}
            {result.debate_health_score !== undefined && (
                <div className="card debate-health-score">
                    <h3 className="card-title">🏥 Debate Health Score</h3>
                    <div className="score-display">
                        <span className={`score-number ${healthClass(result.debate_health_score)}`}>
                            {result.debate_health_score}
                        </span>
                        <span className="score-unit">/100</span>
                    </div>
                    <p className="health-interpretation">{healthLabel(result.debate_health_score)}</p>
                    {result.debate_health_factors && (
                        <div className="health-factors">
                            <h4>Factors:</h4>
                            <ul>
                                {result.debate_health_factors.evidence_quality && (
                                    <li><strong>Evidence quality:</strong> {result.debate_health_factors.evidence_quality}</li>
                                )}
                                {result.debate_health_factors.respectful_engagement && (
                                    <li><strong>Respectful engagement:</strong> {result.debate_health_factors.respectful_engagement}</li>
                                )}
                                {result.debate_health_factors.logical_structure && (
                                    <li><strong>Logical structure:</strong> {result.debate_health_factors.logical_structure}</li>
                                )}
                                {result.debate_health_factors.topic_focus && (
                                    <li><strong>Topic focus:</strong> {result.debate_health_factors.topic_focus}</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* PERSUASION TACTICS */}
            {result.persuasion_tactics && result.persuasion_tactics.length > 0 && (
                <div className="card persuasion-tactics">
                    <h3 className="card-title">🎭 Persuasion Tactics</h3>
                    <ul>
                        {result.persuasion_tactics.map((item, i) => (
                            <li key={i}>
                                <span className="tag">{item.speaker}</span>
                                <strong> {item.tactic}</strong>
                                {item.description && <span> — {item.description}</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* SUGGESTED RESPONSES */}
            {result.suggested_responses && result.suggested_responses.length > 0 && (
                <div className="card suggested-responses">
                    <h3 className="card-title">💬 Suggested Responses</h3>
                    <ol>
                        {result.suggested_responses.map((response, i) => (
                            <li key={i}>{response}</li>
                        ))}
                    </ol>
                </div>
            )}

        </div>
    );
};

export default ResultPanel;
