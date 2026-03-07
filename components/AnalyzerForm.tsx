import React, { useState } from 'react';

interface AnalyzerFormProps {
  onAnalyze: (conversation: string) => void;
  loading: boolean;
}

const AnalyzerForm: React.FC<AnalyzerFormProps> = ({ onAnalyze, loading }) => {
    const [conversationText, setConversationText] = useState('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (conversationText.trim()) {
            onAnalyze(conversationText);
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
                disabled={loading}
            />
            <button type="submit" disabled={loading || !conversationText.trim()}>
                {loading ? 'Analyzing...' : 'Analyze'}
            </button>
        </form>
    );
};

export default AnalyzerForm;