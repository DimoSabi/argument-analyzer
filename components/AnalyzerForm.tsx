import React, { useState } from 'react';

const AnalyzerForm = () => {
    const [conversationText, setConversationText] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        // Trigger analysis logic here
        console.log('Analyzing conversation:', conversationText);
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
            <button type="submit">Analyze</button>
        </form>
    );
};

export default AnalyzerForm;