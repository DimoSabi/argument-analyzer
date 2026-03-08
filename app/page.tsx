'use client';

import { useState } from 'react';
import Head from 'next/head';

type AnalysisResult = {
  claim_map?: unknown;
  logical_issues?: unknown;
  persuasion_tactics?: unknown;
  debate_tactics_detected?: unknown;
  bad_faith_indicators?: unknown;
  ragebait_probability?: number;
  escalation_level?: string;
  debate_health_score?: number;
  suggested_response?: string;
  raw?: string;
};

const STRATEGIES = [
  { value: 'logical', label: 'Logical' },
  { value: 'persuasion', label: 'Persuasion' },
  { value: 'deescalation', label: 'De-escalation' },
  { value: 'dominance', label: 'Dominance' },
];

const Home = () => {
  const [conversation, setConversation] = useState('');
  const [strategy, setStrategy] = useState('logical');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeArgument = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation, strategy }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error ?? 'Network response was not ok');
      }

      const data = await response.json();
      setResults(data.result as AnalysisResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderValue = (value: unknown): string => {
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object' && value !== null) return JSON.stringify(value, null, 2);
    return String(value ?? '');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Head>
        <title>Argument Analyzer</title>
      </Head>
      <h1>Argument Analyzer</h1>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="conversation" style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
          Conversation
        </label>
        <textarea
          id="conversation"
          value={conversation}
          onChange={(e) => setConversation(e.target.value)}
          placeholder="Paste a debate or conversation here..."
          rows={10}
          style={{ width: '100%', padding: 8, boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 14 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="strategy" style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
          Strategy
        </label>
        <select
          id="strategy"
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          style={{ padding: '6px 12px', fontSize: 14 }}
        >
          {STRATEGIES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={analyzeArgument}
        disabled={loading || !conversation.trim()}
        style={{ padding: '8px 20px', fontSize: 14, cursor: loading || !conversation.trim() ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Analyzing\u2026' : 'Analyze Argument'}
      </button>

      {error && (
        <div style={{ marginTop: 16, color: 'red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {results && (
        <div style={{ marginTop: 24 }}>
          <h2>Analysis Results</h2>
          {results.raw ? (
            <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, overflowX: 'auto' }}>
              {results.raw}
            </pre>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.claim_map !== undefined && (
                <ResultCard title="Claim Map" value={renderValue(results.claim_map)} />
              )}
              {results.logical_issues !== undefined && (
                <ResultCard title="Logical Issues" value={renderValue(results.logical_issues)} />
              )}
              {results.persuasion_tactics !== undefined && (
                <ResultCard title="Persuasion Tactics" value={renderValue(results.persuasion_tactics)} />
              )}
              {results.debate_tactics_detected !== undefined && (
                <ResultCard title="Debate Tactics Detected" value={renderValue(results.debate_tactics_detected)} />
              )}
              {results.bad_faith_indicators !== undefined && (
                <ResultCard title="Bad Faith Indicators" value={renderValue(results.bad_faith_indicators)} />
              )}
              {results.ragebait_probability !== undefined && (
                <ResultCard title="Ragebait Probability" value={`${Math.round(Number(results.ragebait_probability) * 100)}%`} />
              )}
              {results.escalation_level !== undefined && (
                <ResultCard title="Escalation Level" value={renderValue(results.escalation_level)} />
              )}
              {results.debate_health_score !== undefined && (
                <ResultCard title="Debate Health Score" value={`${results.debate_health_score} / 100`} />
              )}
              {results.suggested_response !== undefined && (
                <ResultCard title="Suggested Response" value={renderValue(results.suggested_response)} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ResultCard = ({ title, value }: { title: string; value: string }) => (
  <div style={{ background: '#f9f9f9', border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
    <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 15 }}>{title}</h3>
    <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{value}</p>
  </div>
);

export default Home;
