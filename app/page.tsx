import { useState } from 'react';
import Head from 'next/head';

const Home = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);

    try {
      // Example API call
      const response = await fetch('/api/results');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Argument Analyzer</title>
      </Head>
      <h1>Welcome to Argument Analyzer</h1>
      <button onClick={fetchResults}>Fetch Results</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {results && <pre>{JSON.stringify(results, null, 2)}</pre>}
    </div>
  );
};

export default Home;
