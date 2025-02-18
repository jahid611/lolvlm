import React, { useState } from 'react';

function SummonerSearch() {
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setResult(null);
    setError('');
    try {
      // Construit l'URL en encodant les paramètres
      const response = await fetch(
        `http://localhost:3001/api/summoner/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
      );
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Recherche de compte Riot ID</h1>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Game Name (ex. jaydmj23)"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <input
          type="text"
          placeholder="Tag Line (ex. jsyd, sans le #)"
          value={tagLine}
          onChange={(e) => setTagLine(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <button onClick={handleSearch}>Rechercher</button>
      </div>
      { error && <p style={{ color: 'red' }}>Erreur : {error}</p> }
      { result && (
        <div style={{ background: '#f0f0f0', padding: '1rem' }}>
          <p><strong>Game Name :</strong> {result.gameName}</p>
          <p><strong>Tag Line :</strong> {result.tagLine}</p>
          <p><strong>PUUID :</strong> {result.puuid}</p>
        </div>
      )}
    </div>
  );
}

export default SummonerSearch;
