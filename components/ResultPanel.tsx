// Updated ResultPanel.tsx to add card-based UI layout with claim map section, escalation level display, and debate health score.
import React from 'react';
import './ResultPanel.css'; // Assuming there is a CSS file for styles

const ResultPanel = ({ claims, escalationLevel, debateHealthScore }) => {
  return (
    <div className="result-panel">
      <h2>Result Panel</h2>
      <div className="cards">
        {claims.map((claim) => (
          <div className="card" key={claim.id}>
            <h3>{claim.title}</h3>
            <p>{claim.description}</p>
          </div>
        ))}
      </div>
      <div className="escalation-level">
        <h4>Escalation Level:</h4>
        <p>{escalationLevel}</p>
      </div>
      <div className="debate-health-score">
        <h4>Debate Health Score:</h4>
        <p>{debateHealthScore}</p>
      </div>
    </div>
  );
};

export default ResultPanel;
