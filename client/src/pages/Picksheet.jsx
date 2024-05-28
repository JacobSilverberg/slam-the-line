// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Picksheet = () => {
  const [week, setWeek] = useState(1); // Default week is 1
  const [games, setGames] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState({});

  // set baseURL for axios calls
  axios.defaults.baseURL = 'http://localhost:3000';

  useEffect(() => {
    // Calculate the current week based on the current date
    const currentDate = new Date();
    // Adjust the start date of the NFL season as needed
    const startDate = new Date('2024-09-04'); // Example: Start date of the NFL season
    const timeDiff = currentDate.getTime() - startDate.getTime();
    const currentWeek = Math.ceil(timeDiff / (1000 * 3600 * 24 * 7));

    if (currentWeek >= 1 && currentWeek <= 18) {
      setWeek(currentWeek);
    } else {
      setWeek(1);
    }
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get(`/games/${week}`);
        setGames(response.data);
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };

    fetchGames();
  }, [week]);

  const handleSelectTeam = (gameId, teamId) => {
    setSelectedTeam((prev) => ({
      ...prev,
      [gameId]: teamId,
    }));
  };

  const handleSubmitPicks = () => {
    // Logic to handle submitting the picks
    console.log('Submitted Picks:', selectedTeam);
    // You can send the selectedTeam data to your server here if needed
  };

  return (
    <div>
      <h2>Week {week} Picksheet</h2>
      {Array.isArray(games) && games.length > 0 ? (
        games.map((game) => (
          <div key={game.id} style={{ marginBottom: '20px' }}>
            <div className="team-button" id="home-team">
              <span>
                {game.home_team_name} ({game.home_open_spread} /{' '}
                {game.home_curr_spread})
              </span>
              <button
                onClick={() => handleSelectTeam(game.id, game.home_team_id)}
                style={{
                  backgroundColor:
                    selectedTeam[game.id] === game.home_team_id
                      ? 'lightgreen'
                      : '',
                }}
              >
                Select {game.home_team_name}
              </button>
            </div>
            <div className="team-button" id="away-team">
              <span>
                {game.away_team_name} ({game.away_open_spread} /{' '}
                {game.away_curr_spread})
              </span>
              <button
                onClick={() => handleSelectTeam(game.id, game.away_team_id)}
                style={{
                  backgroundColor:
                    selectedTeam[game.id] === game.away_team_id
                      ? 'lightgreen'
                      : '',
                }}
              >
                Select {game.away_team_name}
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No games available for week {week}.</p>
      )}
      <button onClick={handleSubmitPicks}>Submit Picks</button>
    </div>
  );
};

export default Picksheet;
