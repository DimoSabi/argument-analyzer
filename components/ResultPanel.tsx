import React from 'react';

const ResultPanel = ({ analysis }) => {
    return (
        <div className="result-panel">
            <h2>Analysis Results</h2>
            <section>
                <h3>Claims</h3>
                <ul>
                    {analysis.claims.map((claim, index) => (<li key={index}>{claim}</li>))}
                </ul>
            </section>
            <section>
                <h3>Logical Fallacies</h3>
                <ul>
                    {analysis.fallacies.map((fallacy, index) => (<li key={index}>{fallacy}</li>))}
                </ul>
            </section>
            <section>
                <h3>Persuasion Tactics</h3>
                <ul>
                    {analysis.tactics.map((tactic, index) => (<li key={index}>{tactic}</li>))}
                </ul>
            </section>
            <section>
                <h3>Argument Strength Scores</h3>
                <ul>
                    {analysis.strengthScores.map((score, index) => (<li key={index}>{score}</li>))}
                </ul>
            </section>
            <section>
                <h3>Suggested Responses</h3>
                <ul>
                    {analysis.responses.map((response, index) => (<li key={index}>{response}</li>))}
                </ul>
            </section>
        </div>
    );
};

export default ResultPanel;