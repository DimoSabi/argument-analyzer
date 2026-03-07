import React from 'react';
import './ResultPanel.css';

const fallacyDefinitions: Record<string, string> = {
  ad_hominem: 'Attacking the person making the argument instead of addressing the argument itself.',
  strawman: "Misrepresenting or oversimplifying an opponent's position to make it easier to attack.",
  whataboutism: 'Deflecting criticism by pointing to unrelated wrongdoing by the opponent.',
  appeal_to_authority:
    'Claiming something is true because an authority figure said it, without supporting evidence.',
  false_dilemma: 'Presenting only two options when more options exist.',
  hasty_generalization: 'Making a broad conclusion from limited examples.',
  begging_the_question: 'Using the conclusion as evidence for the argument.',
  post_hoc_ergo_propter_hoc:
    'Assuming one event caused another just because it happened first.',
  red_herring: 'Introducing irrelevant information to distract from the main argument.',
  slippery_slope:
    'Assuming one event will inevitably lead to extreme consequences without evidence.',
};

const getIssueDescription = (issueType: string): string => {
  return fallacyDefinitions[issueType] || 'Logical reasoning error detected.';
};

const debateTypeLabels: Record<string, string> = {
  competitive: 'Competitive',
  emotional: 'Emotional Conflict',
  informational: 'Informational',
  trolling: 'Trolling / Bad Faith',
};

interface LogicalIssue {
  speaker: string;
  issue: string;
  description: string;
}

interface DebateTactic {
  tactic: string;
  speaker: string;
  description: string;
  severity: string;
}

interface AnalysisResult {
  claim_map?: Record<string, string[]>;
  logical_issues?: LogicalIssue[];
  persuasion_tactics?: string[];
  debate_tactics_detected?: DebateTactic[];
  bad_faith_indicators?: string[];
  ragebait_probability?: number;
  escalation_level?: string;
  debate_health_score?: number;
  analysis_confidence?: number;
  confidence_reasoning?: string;
  debate_type?: string;
  suggested_response?: string;
  strategy_used?: string;
}

interface ResultPanelProps {
  result: AnalysisResult;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ result }) => {
  const {
    claim_map,
    logical_issues,
    persuasion_tactics,
    debate_tactics_detected,
    bad_faith_indicators,
    ragebait_probability,
    escalation_level,
    debate_health_score,
    analysis_confidence,
    confidence_reasoning,
    debate_type,
    suggested_response,
    strategy_used,
  } = result;

  const confidencePercent =
    analysis_confidence !== undefined ? Math.round(analysis_confidence * 100) : null;

  return (
    <div className="result-panel">
      <h2>Analysis Results</h2>

      {confidencePercent !== null && (
        <div className="confidence-section">
          <h4>Analysis Confidence: {confidencePercent}%</h4>
          {confidence_reasoning && <p className="confidence-reasoning">{confidence_reasoning}</p>}
        </div>
      )}

      {debate_type && (
        <div className="debate-type-section">
          <h4>Debate Type: {debateTypeLabels[debate_type] ?? debate_type}</h4>
        </div>
      )}

      {claim_map && Object.keys(claim_map).length > 0 && (
        <div className="claim-map">
          <h3>Claim Map</h3>
          {Object.entries(claim_map).map(([speaker, claims]) => (
            <div key={speaker} className="speaker-claims">
              <h4>{speaker}</h4>
              <ul>
                {claims.map((claim, idx) => (
                  <li key={idx}>{claim}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {logical_issues && logical_issues.length > 0 && (
        <div className="logical-issues">
          <h3>Logical Issues</h3>
          {logical_issues.map((issue, idx) => (
            <div key={idx} className="logical-issue-item">
              <h4>
                {issue.issue} {issue.speaker ? `(Speaker ${issue.speaker})` : ''}
              </h4>
              <p className="definition">{getIssueDescription(issue.issue)}</p>
              <p className="explanation">{issue.description}</p>
            </div>
          ))}
        </div>
      )}

      {persuasion_tactics && persuasion_tactics.length > 0 && (
        <div className="persuasion-tactics">
          <h3>Persuasion Tactics</h3>
          <ul>
            {persuasion_tactics.map((tactic, idx) => (
              <li key={idx}>{tactic.replace(/_/g, ' ')}</li>
            ))}
          </ul>
        </div>
      )}

      {debate_tactics_detected && debate_tactics_detected.length > 0 && (
        <div className="debate-tactics">
          <h3>Debate Tactics Detected</h3>
          {debate_tactics_detected.map((t, idx) => (
            <div key={idx} className="tactic-item">
              <h4>
                {t.tactic.replace(/_/g, ' ')} — Speaker {t.speaker}{' '}
                <span className={`severity severity-${t.severity}`}>({t.severity})</span>
              </h4>
              <p>{t.description}</p>
            </div>
          ))}
        </div>
      )}

      {bad_faith_indicators && bad_faith_indicators.length > 0 && (
        <div className="bad-faith-indicators">
          <h3>Bad Faith Indicators</h3>
          <ul>
            {bad_faith_indicators.map((indicator, idx) => (
              <li key={idx}>{indicator}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="metrics-row">
        {escalation_level && (
          <div className="escalation-level">
            <h4>Escalation Level</h4>
            <p>{escalation_level}</p>
          </div>
        )}

        {debate_health_score !== undefined && (
          <div className="debate-health-score">
            <h4>Debate Health Score</h4>
            <p>{debate_health_score}/100</p>
          </div>
        )}

        {ragebait_probability !== undefined && (
          <div className="ragebait-probability">
            <h4>Ragebait Probability</h4>
            <p>{ragebait_probability}%</p>
          </div>
        )}
      </div>

      {suggested_response && (
        <div className="suggested-responses">
          <h3>Suggested Response</h3>
          <p>{suggested_response}</p>
          {strategy_used && <p className="strategy-used">Strategy: {strategy_used}</p>}
        </div>
      )}
    </div>
  );
};

export default ResultPanel;
