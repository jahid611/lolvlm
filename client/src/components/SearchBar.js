import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');

  const handleSearch = () => {
    if (gameName && tagLine) {
      onSearch(gameName, tagLine);
    }
  };

  return (
    <div className="search-bar">
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
