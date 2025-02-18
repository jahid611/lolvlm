import React from 'react';

function SummonerProfile({ summoner }) {
  if (!summoner) return null;

  const profileIconUrl = `https://ddragon.leagueoflegends.com/cdn/15.3.1/img/profileicon/${summoner.profileIconId}.png`;

  return (
    <div className="profile-section">
      <img src={profileIconUrl} alt="Profile Icon" className="profile-icon" />
      <div className="profile-details">
        <h2 className="profile-name">
          {summoner.name} <span className="tagline">({summoner.gameName}#{summoner.tagLine})</span>
        </h2>
        <p className="profile-level">Niveau {summoner.summonerLevel}</p>
        {/* Pas d'affichage du PUUID */}
      </div>
    </div>
  );
}

export default SummonerProfile;
