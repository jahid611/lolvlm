import React from 'react';

function getRankIcon(tier) {
  switch ((tier || '').toUpperCase()) {
    case 'IRON': return '/ranked-emblems/Emblem_Iron.png';
    case 'BRONZE': return '/ranked-emblems/Emblem_Bronze.png';
    case 'SILVER': return '/ranked-emblems/Emblem_Silver.png';
    case 'GOLD': return '/ranked-emblems/Emblem_Gold.png';
    case 'PLATINUM': return '/ranked-emblems/Emblem_Platinum.png';
    case 'DIAMOND': return '/ranked-emblems/Emblem_Diamond.png';
    case 'MASTER': return '/ranked-emblems/Emblem_Master.png';
    case 'GRANDMASTER': return '/ranked-emblems/Emblem_Grandmaster.png';
    case 'CHALLENGER': return '/ranked-emblems/Emblem_Challenger.png';
    default: return '/ranked-emblems/Emblem_Unranked.png';
  }
}

function SummonerRank({ leagueEntries }) {
  if (!leagueEntries || leagueEntries.length === 0) {
    return (
      <div className="rank-section">
        <p>Aucune information de rang.</p>
      </div>
    );
  }

  return (
    <div className="rank-section">
      <h3>Classements</h3>
      {leagueEntries.map(entry => {
        const rankIcon = getRankIcon(entry.tier);
        return (
          <div key={entry.queueType} className="rank-card">
            <img src={rankIcon} alt={entry.tier} className="rank-icon" />
            <div className="rank-info">
              <p><strong>File :</strong> {entry.queueType}</p>
              <p><strong>Rang :</strong> {entry.tier} {entry.rank}</p>
              <p><strong>LP :</strong> {entry.leaguePoints}</p>
              <p><strong>W/L :</strong> {entry.wins} / {entry.losses}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SummonerRank;
