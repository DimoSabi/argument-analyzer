import React, { useState } from 'react';

interface AnalyzerFormProps {
    onResult: (result: object, strategy: string) => void;
    onLoading: (loading: boolean) => void;
    onError: (error: string | null) => void;
}

const AnalyzerForm = ({ onResult, onLoading, onError }: AnalyzerFormProps) => {
    const [conversationText, setConversationText] = useState('');
    const [strategy, setStrategy] = useState('logical');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onLoading(true);
        onError(null);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversation: conversationText, strategy }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Analysis request failed');
            }

            const data = await response.json();
            onResult(data, strategy);
        } catch (err: unknown) {
            onError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            onLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                value={conversationText}
                onChange={(e) => setConversationText(e.target.value)}
                placeholder="Enter conversation text..."
                rows={10}
                style={{ width: '100%' }}
            />
            <div style={{ margin: '10px 0' }}>
                <label htmlFor="strategy" style={{ marginRight: '8px', fontWeight: 'bold' }}>
                    Response Strategy:
                </label>
                <select
                    name="strategy"
                    id="strategy"
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                >
                    <option value="logical">Logical (Evidence &amp; Clarity)</option>
                    <option value="persuasion">Persuasion (Psychological Framing)</option>
                    <option value="deescalation">De-escalation (Reduce Conflict)</option>
                    <option value="dominance">Dominance (Assert Control)</option>
                    <option value="audience_persuasion">Audience Persuasion (Convince Observers)</option>
                </select>
            </div>
            <button type="submit">Analyze</button>
        </form>
    );
};

export default AnalyzerForm;