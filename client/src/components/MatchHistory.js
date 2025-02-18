// client/src/components/MatchHistory.js

import React from 'react';
import queues from '../data/queues.json';

/** Récupérer le nom de la queue */
function getQueueName(queueId) {
  const queue = queues.find(q => q.queueId === queueId);
  return queue ? queue.description : `Queue ${queueId}`;
}

/** Mapping Summoner Spell ID -> icône */
function getSummonerSpellIcon(id) {
  switch (id) {
    case 1: return "SummonerBoost.png";    // Cleanse
    case 3: return "SummonerExhaust.png";
    case 4: return "SummonerFlash.png";
    case 6: return "SummonerHaste.png";    // Ghost
    case 7: return "SummonerHeal.png";
    case 11: return "SummonerSmite.png";
    case 12: return "SummonerTeleport.png";
    case 14: return "SummonerDot.png";     // Ignite
    case 21: return "SummonerBarrier.png";
    case 32: return "SummonerSnowball.png";
    default: return "Summoner_Undefined.png";
  }
}

/** Mapping Item ID -> URL */
function getItemUrl(itemId) {
  if (!itemId || itemId === 0) return null;
  return `https://ddragon.leagueoflegends.com/cdn/15.3.1/img/item/${itemId}.png`;
}

function MatchHistory({ matches }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="matches-section">
        <p>Pas de match récent.</p>
      </div>
    );
  }

  return (
    <div className="matches-section">
      <h3>Matchs récents (op.gg style, plus propre)</h3>

      {matches.map((match, idx) => {
        const { gameMode, gameDuration, queueId, teams } = match;
        const durationM = Math.floor(gameDuration / 60);
        const durationS = (gameDuration % 60).toString().padStart(2, '0');

        // team[0] => team 100, team[1] => team 200
        const team1 = teams[0];
        const team2 = teams[1];

        // Identifier winner/loser
        const team1Win = team1.win === true || team1.win === "Win";
        const team2Win = team2.win === true || team2.win === "Win";

        let loserTeam, winnerTeam;
        if (team1Win) {
          winnerTeam = team1;
          loserTeam = team2;
        } else {
          winnerTeam = team2;
          loserTeam = team1;
        }

        // Calcul kills/gold
        const loserKills = loserTeam.participants.reduce((sum, p) => sum + p.kills, 0);
        const loserGold = loserTeam.participants.reduce((sum, p) => sum + p.goldEarned, 0);
        const winnerKills = winnerTeam.participants.reduce((sum, p) => sum + p.kills, 0);
        const winnerGold = winnerTeam.participants.reduce((sum, p) => sum + p.goldEarned, 0);

        // Label
        const loserLabel = (loserTeam.win === true || loserTeam.win === "Win") ? "Victoire" : "Défaite";
        const winnerLabel = (winnerTeam.win === true || winnerTeam.win === "Win") ? "Victoire" : "Défaite";

        return (
          <div key={match.matchId} className="opgg-match-card">
            {/* Header */}
            <div className="opgg-match-header">
              <div className="opgg-match-info">
                <strong>Match {idx + 1}</strong> - Mode : {gameMode} ({getQueueName(queueId)})
                <br />
                Durée : {durationM}:{durationS}
              </div>
            </div>

            {/* Loser team block */}
            <div className="opgg-team-block opgg-team-loser">
              <div className="opgg-team-title lose">
                {loserLabel} (Team {loserTeam.teamId}) 
                — {loserKills} Kills | {loserGold} Gold
              </div>
              {/* Joueurs */}
              {loserTeam.participants.map((player, i) => {
                const summ1 = getSummonerSpellIcon(player.summoner1Id);
                const summ2 = getSummonerSpellIcon(player.summoner2Id);
                const items = [0,1,2,3,4,5,6].map(slot => {
                  const itemKey = `item${slot}`;
                  const itemId = player[itemKey];
                  const url = getItemUrl(itemId);
                  return url ? (
                    <img
                      key={slot}
                      src={url}
                      alt={`item${slot}`}
                      className="opgg-item-icon"
                    />
                  ) : (
                    <span key={slot} className="opgg-item-empty" />
                  );
                });

                return (
                  <div key={i} className="opgg-player-row">
                    <div className="opgg-player-champion">{player.championName}</div>
                    <div className="opgg-player-summoner">{player.summonerName}</div>
                    <div className="opgg-player-kda">{player.kills}/{player.deaths}/{player.assists}</div>
                    <div className="opgg-player-gold">{player.goldEarned}</div>
                    <div className="opgg-player-damage">{player.totalDamageDealtToChampions}</div>
                    <div className="opgg-player-cs">{player.creepScore}</div>
                    <div className="opgg-player-spells">
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/15.3.1/img/spell/${summ1}`}
                        alt="summ1"
                        className="opgg-spell-icon"
                      />
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/15.3.1/img/spell/${summ2}`}
                        alt="summ2"
                        className="opgg-spell-icon"
                      />
                    </div>
                    <div className="opgg-player-items">
                      {items}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Winner team block */}
            <div className="opgg-team-block opgg-team-winner">
              <div className="opgg-team-title win">
                {winnerLabel} (Team {winnerTeam.teamId})
                — {winnerKills} Kills | {winnerGold} Gold
              </div>
              {/* Joueurs */}
              {winnerTeam.participants.map((player, i) => {
                const summ1 = getSummonerSpellIcon(player.summoner1Id);
                const summ2 = getSummonerSpellIcon(player.summoner2Id);
                const items = [0,1,2,3,4,5,6].map(slot => {
                  const itemKey = `item${slot}`;
                  const itemId = player[itemKey];
                  const url = getItemUrl(itemId);
                  return url ? (
                    <img
                      key={slot}
                      src={url}
                      alt={`item${slot}`}
                      className="opgg-item-icon"
                    />
                  ) : (
                    <span key={slot} className="opgg-item-empty" />
                  );
                });

                return (
                  <div key={i} className="opgg-player-row">
                    <div className="opgg-player-champion">{player.championName}</div>
                    <div className="opgg-player-summoner">{player.summonerName}</div>
                    <div className="opgg-player-kda">{player.kills}/{player.deaths}/{player.assists}</div>
                    <div className="opgg-player-gold">{player.goldEarned}</div>
                    <div className="opgg-player-damage">{player.totalDamageDealtToChampions}</div>
                    <div className="opgg-player-cs">{player.creepScore}</div>
                    <div className="opgg-player-spells">
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/15.3.1/img/spell/${summ1}`}
                        alt="summ1"
                        className="opgg-spell-icon"
                      />
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/15.3.1/img/spell/${summ2}`}
                        alt="summ2"
                        className="opgg-spell-icon"
                      />
                    </div>
                    <div className="opgg-player-items">
                      {items}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MatchHistory;
