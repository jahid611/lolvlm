import React from 'react';
import queues from '../data/queues.json';

// Exemple minimal pour Wukong
const championMapping = {
  Wukong: "MonkeyKing.png" // la vrai image ID sur DDragon
};

// Fonction pour trouver le label de la queue
function getQueueName(queueId) {
  const queue = queues.find(q => q.queueId === queueId);
  return queue ? queue.description : `Queue ${queueId}`;
}

function MatchHistory({ matches }) {
  if (!matches || matches.length === 0) {
    return <div className="matches-section"><p>Pas de match récent.</p></div>;
  }

  return (
    <div className="matches-section">
      <h3>Matchs récents</h3>
      {matches.map(match => {
        // Corriger le nom d'image si championName est "Wukong"
        const realChampionName = championMapping[match.championName] || `${match.championName}.png`;

        return (
          <div key={match.matchId} className={`match-card ${match.win ? 'match-win' : 'match-lose'}`}>
            <div>
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/15.3.1/img/champion/${realChampionName}`}
                alt={match.championName}
                onError={(e) => { e.target.src = 'https://ddragon.leagueoflegends.com/cdn/15.3.1/img/champion/Teemo.png'; }}
              />
              <strong>{match.championName}</strong>
            </div>
            <div className="match-info">
              <p>{match.kills} / {match.deaths} / {match.assists}</p>
              <p>Durée : {Math.floor(match.gameDuration / 60)}:{(match.gameDuration % 60).toString().padStart(2, '0')}</p>
              <p>Mode : {match.gameMode} ({getQueueName(match.queueId)})</p>
              <p>CS : {match.creepScore}</p>
            </div>
            <div className="match-result">
              {match.win ? 'Victoire' : 'Défaite'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MatchHistory;
