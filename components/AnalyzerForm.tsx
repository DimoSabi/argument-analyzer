import React, { useState } from 'react';

interface AnalyzerFormProps {
    onAnalyze: (conversation: string) => void;
    loading?: boolean;
}

const AnalyzerForm = ({ onAnalyze, loading = false }: AnalyzerFormProps) => {
    const [conversationText, setConversationText] = useState('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (conversationText.trim()) {
            onAnalyze(conversationText.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                value={conversationText}
                onChange={(e) => setConversationText(e.target.value)}
                placeholder="Paste the conversation or argument text here..."
                rows={10}
                style={{ width: '100%' }}
                disabled={loading}
            />
            <button type="submit" disabled={loading || !conversationText.trim()}>
                {loading ? 'Analyzing…' : 'Analyze'}
            </button>
        </form>
    );
};

export default AnalyzerForm;