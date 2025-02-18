import React from 'react';

function SummonerRank({ leagueEntries }) {
  if (!leagueEntries || leagueEntries.length === 0) {
    return <div className="rank-section"><p>Aucune information de rang.</p></div>;
  }

  return (
    <div className="rank-section">
      <h3>Classements</h3>
      {leagueEntries.map(entry => (
        <div key={entry.queueType} className="rank-card">
          <p><strong>File :</strong> {entry.queueType}</p>
          <p><strong>Rang :</strong> {entry.tier} {entry.rank}</p>
          <p><strong>LP :</strong> {entry.leaguePoints}</p>
          <p><strong>W/L :</strong> {entry.wins} / {entry.losses}</p>
        </div>
      ))}
    </div>
  );
}

export default SummonerRank;
