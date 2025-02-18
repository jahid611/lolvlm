import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [region, setRegion] = useState('euw');
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');

  const handleSearch = () => {
    if (gameName && tagLine) {
      onSearch(region, gameName, tagLine);
    }
  };

  return (
    <div className="search-bar">
      <select value={region} onChange={(e) => setRegion(e.target.value)}>
        <option value="euw">EUW</option>
        <option value="eune">EUNE</option>
        <option value="na">NA</option>
        <option value="kr">KR</option>
        <option value="jp">JP</option>
      </select>
      <input
        type="text"
        placeholder="Game Name (ex: Jaydmj23)"
        value={gameName}
        onChange={(e) => setGameName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Tag (ex: jsyd, sans #)"
        value={tagLine}
        onChange={(e) => setTagLine(e.target.value)}
      />
      <button onClick={handleSearch}>Rechercher</button>
    </div>
  );
}

export default SearchBar;
