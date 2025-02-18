import React, { useState } from 'react';
import './styles/opggProfessional.css';
import SearchBar from './components/SearchBar';
import SummonerProfile from './components/SummonerProfile';
import SummonerRank from './components/SummonerRank';
import MatchHistory from './components/MatchHistory';

function getBaseURL() {
  if (process.env.NODE_ENV === 'production') {
    // URL de votre back-end déployé (ex. Render)
    return 'https://lolvlm.onrender.com';
  } else {
    // URL de votre back-end local
    return 'http://localhost:3001';
  }
}

function App() {
  const [summoner, setSummoner] = useState(null);
  const [leagueEntries, setLeagueEntries] = useState([]);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (region, gameName, tagLine) => {
    setError('');
    setSummoner(null);
    setLeagueEntries([]);
    setMatches([]);

    const baseURL = getBaseURL();

    try {
      // 1) Récupérer le profil
      let res = await fetch(`${baseURL}/api/summoner/${region}/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Joueur introuvable dans cette région.');
        } else {
          throw new Error('Erreur lors de la récupération du profil.');
        }
      }
      const summonerData = await res.json();
      setSummoner(summonerData);

      // 2) Récupérer le classement
      res = await fetch(`${baseURL}/api/league/${region}/${summonerData.id}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Aucune information de rang trouvée.');
        } else {
          throw new Error('Erreur lors de la récupération des classements.');
        }
      }
      const leagueData = await res.json();
      setLeagueEntries(leagueData);

      // 3) Récupérer l'historique de matchs
      res = await fetch(`${baseURL}/api/matches/${region}/${summonerData.puuid}?count=5`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Pas de matchs récents.');
        } else {
          throw new Error('Erreur lors de la récupération des matchs.');
        }
      }
      const matchesData = await res.json();
      setMatches(matchesData);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Impossible de récupérer les données du joueur.');
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
