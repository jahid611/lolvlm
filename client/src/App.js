import React, { useState } from 'react';
import './styles/opggStyle.css';
import SearchBar from './components/SearchBar';
import SummonerProfile from './components/SummonerProfile';
import SummonerRank from './components/SummonerRank';
import MatchHistory from './components/MatchHistory';

function App() {
  const [summoner, setSummoner] = useState(null);
  const [leagueEntries, setLeagueEntries] = useState([]);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (gameName, tagLine) => {
    setError('');
    setSummoner(null);
    setLeagueEntries([]);
    setMatches([]);

    try {
      // 1. Récupération du profil
      let res = await fetch(`http://localhost:3001/api/summoner/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
      if (!res.ok) throw new Error('Erreur lors de la récupération du profil.');
      const summonerData = await res.json();
      setSummoner(summonerData);

      // 2. Récupération des informations de classement
      res = await fetch(`http://localhost:3001/api/league/${summonerData.id}`);
      if (!res.ok) throw new Error('Erreur lors de la récupération des classements.');
      const leagueData = await res.json();
      setLeagueEntries(leagueData);

      // 3. Récupération de l'historique de matchs (5 derniers matchs)
      res = await fetch(`http://localhost:3001/api/matches/${summonerData.puuid}?count=5`);
      if (!res.ok) throw new Error('Erreur lors de la récupération des matchs.');
      const matchesData = await res.json();
      setMatches(matchesData);
    } catch (err) {
      console.error(err);
      setError('Impossible de récupérer les données du joueur.');
    }
  };

  return (
    <div>
      <header className="header">
        <h1>Recherche de compte Riot (style op.gg)</h1>
      </header>
      <div className="container">
        <SearchBar onSearch={handleSearch} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <SummonerProfile summoner={summoner} />
        <SummonerRank leagueEntries={leagueEntries} />
        <MatchHistory matches={matches} />
      </div>
    </div>
  );
}

export default App;
