'use client';

import { useState } from 'react';
import AnalyzerForm from '../components/AnalyzerForm';
import ResultPanel from '../components/ResultPanel';

export default function Home() {
  const [result, setResult] = useState(null);
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

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error ?? 'Analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ marginBottom: 8 }}>🧠 Argument Analyzer</h1>
      <p style={{ color: '#555', marginBottom: 24 }}>
        Paste a conversation or debate below and get a structured argument analysis.
      </p>
      <AnalyzerForm onAnalyze={handleAnalyze} loading={loading} />
      {error && (
        <p style={{ color: '#e53e3e', marginTop: 16 }}>Error: {error}</p>
      )}
      {result && <ResultPanel result={result} />}
    </main>
  );
}
