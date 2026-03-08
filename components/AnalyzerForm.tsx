'use client';

import React, { useState } from 'react';

const AnalyzerForm = () => {
    const [conversationText, setConversationText] = useState('');
    const [strategy, setStrategy] = useState('Dominance');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversation: conversationText,
                    strategy: strategy
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to analyze');
                return;
            }

            setResult(data.result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Conversation</label>
                    <textarea
                        value={conversationText}
                        onChange={(e) => setConversationText(e.target.value)}
                        placeholder="Enter conversation text..."
                        rows={10}
                        style={{ width: '100%' }}
                    />
                </div>

                <div>
                    <label>Strategy</label>
                    <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
                        <option>Dominance</option>
                        <option>De-escalation</option>
                        <option>Compromise</option>
                    </select>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Analyzing...' : 'Analyze Argument'}
                </button>
            </form>

            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {result && (
                <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
                    <h3>Results</h3>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default AnalyzerForm;
