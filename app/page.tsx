'use client';

import { useState } from 'react';
import AnalyzerForm from '../components/AnalyzerForm';
import ResultPanel from '../components/ResultPanel';

interface AnalysisResult {
  claim_map?: Record<string, string[]>;
  logical_issues?: { speaker: string; issue: string; description: string }[];
  persuasion_tactics?: string[];
  debate_tactics_detected?: { tactic: string; speaker: string; description: string; severity: string }[];
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

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (conversation: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred during analysis');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Argument Analyzer</h1>
      <AnalyzerForm onAnalyze={handleAnalyze} loading={loading} />
      {error && (
        <div style={{ color: 'red', margin: '10px 0', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
          {error}
        </div>
      )}
      {result && <ResultPanel result={result} />}
    </div>
  );
}
