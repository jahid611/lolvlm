import React from 'react';

function SummonerProfile({ summoner }) {
  if (!summoner) return null;

  // Utilise Data Dragon pour l'icône de profil
  const profileIconUrl = `https://ddragon.leagueoflegends.com/cdn/15.3.1/img/profileicon/${summoner.profileIconId}.png`;

  return (
    <div className="profile-section">
      <div className="profile-header">
        <img src={profileIconUrl} alt="Profile Icon" />
        <div>
          <h2>{summoner.name} ({summoner.gameName}#{summoner.tagLine})</h2>
          <p>Niveau {summoner.summonerLevel}</p>
          <p>PUUID : {summoner.puuid}</p>
        </div>
      </div>
    </div>
  );
}

export default SummonerProfile;
