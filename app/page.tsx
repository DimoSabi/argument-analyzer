'use client';

import { useState } from 'react';
import Head from 'next/head';
import AnalyzerForm from '../components/AnalyzerForm';
import ResultPanel from '../components/ResultPanel';

const Home = () => {
  const [result, setResult] = useState<object | null>(null);
  const [strategy, setStrategy] = useState<string>('logical');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResult = (data: object, selectedStrategy: string) => {
    setResult(data);
    setStrategy(selectedStrategy);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Head>
        <title>Argument Analyzer</title>
      </Head>
      <h1>Argument Analyzer</h1>
      <AnalyzerForm
        onResult={handleResult}
        onLoading={setLoading}
        onError={setError}
      />
      {loading && <p>Analyzing...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {result && !loading && (
        <ResultPanel result={result} strategy={strategy} />
      )}
    </div>
  );
};

export default Home;
