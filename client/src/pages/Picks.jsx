import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Picks = () => {
  const [data, setData] = useState([]);
  const [selections, setSelections] = useState({});

  useEffect(() => {
    axios
      .get('http://localhost:3001/api/data')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error('There was an error fetching the data!', error);
      });
  }, []);

  const handleInputChange = (gameId, event) => {
    const value = event.target.value;
    setSelections((prevState) => ({
      ...prevState,
      [gameId]: { ...prevState[gameId], wager: value },
    }));
  };

  const handleButtonClick = (gameId, spreadType) => {
    setSelections((prevState) => ({
      ...prevState,
      [gameId]: { ...prevState[gameId], spread: spreadType },
    }));
  };

  const handleSubmit = (gameId) => {
    const selectedData = selections[gameId];
    axios
      .post('http://localhost:3001/api/submit', { selectedData })
      .then((response) => {
        console.log('Data submitted successfully');
      })
      .catch((error) => {
        console.error('There was an error submitting the data!', error);
      });
  };

  return (
    <div>
      <h1>Fetched Data</h1>
      <ul>
        {data.map((game) => (
          <li key={game.gameId}>
            <div>
              <span>
                {game.homeTeam} vs {game.awayTeam}
              </span>
              <button onClick={() => handleButtonClick(game.gameId, 'home')}>
                Home Spread: {game.spread}
              </button>
              <button onClick={() => handleButtonClick(game.gameId, 'away')}>
                Away Spread: {game.spread}
              </button>
              <input
                type="number"
                placeholder="Wager Points"
                value={selections[game.gameId]?.wager || ''}
                onChange={(e) => handleInputChange(game.gameId, e)}
              />
              <button onClick={() => handleSubmit(game.gameId)}>
                Submit Wager
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Picks;
