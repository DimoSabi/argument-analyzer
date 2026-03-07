// Updated ResultPanel.tsx to add card-based UI layout with claim map section, escalation level display, debate health score, and debate tactics detection.
import React from 'react';
import './ResultPanel.css';

interface LogicalIssue {
  speaker: string;
  issue: string;
  description: string;
}

interface DebateTactic {
  tactic: string;
  speaker: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
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
  suggested_response?: string;
}

const TACTIC_DEFINITIONS: Record<string, string> = {
  gish_gallop:
    'Overwhelming opponent with numerous loosely-supported arguments to prevent thorough rebuttal',
  motte_and_bailey:
    'Advancing a controversial claim, then retreating to a weaker defensible position when challenged',
  sealioning:
    'Asking persistent "innocent" questions in bad faith to exhaust opponent or appear reasonable while disrupting',
  whataboutism:
    "Deflecting criticism by pointing to unrelated wrongs by the opponent",
  ad_hominem:
    'Attacking the person making the argument rather than addressing the argument itself',
  strawman:
    "Misrepresenting or oversimplifying opponent's position to make it easier to attack",
};

function getTacticDefinition(tactic: string): string {
  return TACTIC_DEFINITIONS[tactic] ?? 'A debate manipulation tactic';
}

function formatTacticName(tactic: string): string {
  return tactic
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateShareReport(result: AnalysisResult): string {
  const lines: string[] = [];

  lines.push('=== ARGUMENT ANALYZER REPORT ===\n');

  if (result.escalation_level) {
    lines.push(`ESCALATION LEVEL: ${result.escalation_level}`);
  }
  if (result.debate_health_score !== undefined) {
    lines.push(`DEBATE HEALTH SCORE: ${result.debate_health_score}/100`);
  }
  if (result.ragebait_probability !== undefined) {
    lines.push(`RAGEBAIT PROBABILITY: ${result.ragebait_probability}%`);
  }

  if (result.claim_map && Object.keys(result.claim_map).length > 0) {
    lines.push('\nCLAIM MAP');
    for (const [speaker, claims] of Object.entries(result.claim_map)) {
      lines.push(`${speaker}:`);
      claims.forEach((claim) => lines.push(`  - ${claim}`));
    }
  }

  if (result.logical_issues && result.logical_issues.length > 0) {
    lines.push('\nLOGICAL ISSUES');
    result.logical_issues.forEach((issue) => {
      lines.push(`${issue.speaker}: ${issue.issue}`);
      lines.push(`  ${issue.description}`);
    });
  }

  if (result.debate_tactics_detected && result.debate_tactics_detected.length > 0) {
    lines.push('\nDEBATE TACTICS DETECTED');
    result.debate_tactics_detected.forEach((tactic) => {
      const severity =
        tactic.severity.charAt(0).toUpperCase() + tactic.severity.slice(1);
      lines.push(`${formatTacticName(tactic.tactic)} (${severity})`);
      lines.push(`Speaker: ${tactic.speaker}`);
      lines.push(tactic.description);
      lines.push('');
    });
  }

  if (result.suggested_response) {
    lines.push('\nSUGGESTED RESPONSE');
    lines.push(result.suggested_response);
  }

  return lines.join('\n');
}

const ResultPanel = ({
  claims,
  escalationLevel,
  debateHealthScore,
  result,
}: {
  claims?: Array<{ id: string | number; title: string; description: string }>;
  escalationLevel?: string;
  debateHealthScore?: number;
  result?: AnalysisResult;
}) => {
  const analysisResult = result ?? {};
  const debateTactics = analysisResult.debate_tactics_detected ?? [];
  const [copyStatus, setCopyStatus] = React.useState<'idle' | 'copied' | 'error'>('idle');

  const handleShare = () => {
    const report = generateShareReport(analysisResult);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(report).then(
        () => {
          setCopyStatus('copied');
          setTimeout(() => setCopyStatus('idle'), 2000);
        },
        () => {
          setCopyStatus('error');
          setTimeout(() => setCopyStatus('idle'), 2000);
        }
      );
    } else {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  return (
    <div className="result-panel">
      <h2>Result Panel</h2>

      {claims && claims.length > 0 && (
        <div className="cards">
          {claims.map((claim) => (
            <div className="card" key={claim.id}>
              <h3>{claim.title}</h3>
              <p>{claim.description}</p>
            </div>
          ))}
        </div>
      )}

      {analysisResult.claim_map && Object.keys(analysisResult.claim_map).length > 0 && (
        <div className="claim-map">
          <h3>🗺️ Claim Map</h3>
          {Object.entries(analysisResult.claim_map).map(([speaker, speakerClaims]) => (
            <div key={speaker} className="speaker-claims">
              <h4>{speaker}</h4>
              <ul>
                {speakerClaims.map((claim, idx) => (
                  <li key={idx}>{claim}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="escalation-level">
        <h4>Escalation Level:</h4>
        <p>{analysisResult.escalation_level ?? escalationLevel}</p>
      </div>

      <div className="debate-health-score">
        <h4>Debate Health Score:</h4>
        <p>{analysisResult.debate_health_score ?? debateHealthScore}</p>
      </div>

      {analysisResult.ragebait_probability !== undefined && (
        <div className="ragebait-probability">
          <h4>Ragebait Probability:</h4>
          <p>{analysisResult.ragebait_probability}%</p>
        </div>
      )}

      {analysisResult.logical_issues && analysisResult.logical_issues.length > 0 && (
        <div className="logical-issues">
          <h3>⚠️ Logical Issues</h3>
          {analysisResult.logical_issues.map((issue, idx) => (
            <div key={idx} className="issue-item">
              <strong>{issue.speaker}</strong>: {issue.issue}
              <p>{issue.description}</p>
            </div>
          ))}
        </div>
      )}

      {debateTactics.length > 0 && (
        <div className="debate-tactics-card">
          <h3>🎯 Debate Tactics Detected</h3>
          {debateTactics.map((tactic) => (
            <div key={tactic.tactic} className="tactic-item">
              <h4>{formatTacticName(tactic.tactic)}</h4>
              <p className="definition">{getTacticDefinition(tactic.tactic)}</p>
              <p className="speaker">Speaker: {tactic.speaker}</p>
              <p className="description">{tactic.description}</p>
              <span className={`severity ${tactic.severity}`}>
                {tactic.severity}
              </span>
            </div>
          ))}
        </div>
      )}

      {analysisResult.suggested_response && (
        <div className="suggested-responses">
          <h3>💬 Suggested Response</h3>
          <p>{analysisResult.suggested_response}</p>
        </div>
      )}

      {Object.keys(analysisResult).length > 0 && (
        <button className="share-button" onClick={handleShare}>
          {copyStatus === 'copied'
            ? '✅ Copied!'
            : copyStatus === 'error'
            ? '❌ Copy failed'
            : '📋 Copy Report to Clipboard'}
        </button>
      )}
    </div>
  );
};

export default ResultPanel;
