import React from 'react';

// Data Dragon champion images:
// https://ddragon.leagueoflegends.com/cdn/15.3.1/img/champion/Aatrox.png
// (on doit parfois mapper championName -> imageName, ex. "Wukong" => "MonkeyKing.png" ...)

function MatchHistory({ matches }) {
  if (!matches || matches.length === 0) {
    return <div className="matches-section">Pas de match récent.</div>;
  }

  // Petite fonction utilitaire pour tenter de mapper un championName
  // vers le fichier PNG exact. Pour être 100% fiable, il vaut mieux
  // récupérer la liste champion.json et faire la correspondance ID -> name.
  const championToImage = (champ) => {
    // Ex. "KhaZix" => "Khazix.png"
    return champ.replace(/[^a-zA-Z]/g, '') + '.png';
  };

  return (
    <div className="matches-section">
      <h3>Matchs récents</h3>
      {matches.map((match) => {
        const championImg = championToImage(match.championName);
        return (
          <div
            key={match.matchId}
            className={`match-card ${match.win ? 'match-win' : 'match-lose'}`}
          >
            <div>
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/15.3.1/img/champion/${championImg}`}
                alt={match.championName}
                style={{ width: '40px', marginRight: '8px', verticalAlign: 'middle' }}
                onError={(e) => {
                  // si l'image n'est pas trouvée, fallback
                  e.target.src =
                    'https://ddragon.leagueoflegends.com/cdn/15.3.1/img/champion/Teemo.png';
                }}
              />
              <strong>{match.championName}</strong>
            </div>
            <div>
              {match.kills} / {match.deaths} / {match.assists}
            </div>
            <div>{match.win ? 'Victoire' : 'Défaite'}</div>
          </div>
        );
      })}
    </div>
  );
}

export default MatchHistory;
