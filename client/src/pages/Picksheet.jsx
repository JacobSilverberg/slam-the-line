import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import getUserId from '../services/getUserId';
import { WeekContext } from '../context/WeekContext';

const Picksheet = () => {
  const { leagueId } = useParams();
  const { week } = useContext(WeekContext);
  const [games, setGames] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState({});
  const [selectedCount, setSelectedCount] = useState(0);

  const userId = getUserId();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/games/${week}`);
        setGames(response.data);
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };
    fetchGames();
  }, [week]);

  const handleSelectTeam = (gameId, teamId) => {
    setSelectedTeam((prev) => {
      // If the team is already selected, deselect it
      if (prev[gameId] === teamId) {
        const updatedSelection = { ...prev };
        delete updatedSelection[gameId];
        setSelectedCount(Object.keys(updatedSelection).length);
        return updatedSelection;
      }

      // Otherwise, select the team
      const updatedSelection = { ...prev, [gameId]: teamId };
      setSelectedCount(Object.keys(updatedSelection).length);
      return updatedSelection;
    });
  };

  const handleSubmitPicks = async (e) => {
    e.preventDefault();

    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updatedAt = createdAt;

    // Prepare the form data with game_id, created_at, updated_at, and points
    const formData = games.map((game) => ({
      gameId: game.id,
      points: 0,
      createdAt,
      updatedAt,
    }));

    try {
      await axios.post(
        `http://localhost:3000/submitpicks/${leagueId}/users/${userId}`,
        formData
      );
    } catch (err) {
      if (err.response) {
        console.error(err.response.data);
      } else {
        console.error(err.message);
      }
    }
  };

  return (
    <div className="main-container">
      <h2>Week {week} Picksheet</h2>
      <p>Selected {selectedCount} games</p>
      {Array.isArray(games) && games.length > 0 ? (
        games.map((game) => (
          <div className="game-container" key={game.id}>
            {/* Home team */}
            <div
              className={`team-button ${selectedTeam[game.id] === game.home_team_id ? 'selected' : ''}`}
              id="home"
              onClick={() => handleSelectTeam(game.id, game.home_team_id)}
            >
              <span className="team-name">{game.home_team_name}</span>
              <span className="open-spread" id="home">
                (Open: {game.home_open_spread}
              </span>{' '}
              <span className="curr-spread" id="home">
                Current: {game.home_curr_spread})
              </span>
            </div>

            {/* Away team */}
            <div
              className={`team-button ${selectedTeam[game.id] === game.away_team_id ? 'selected' : ''}`}
              id="away"
              onClick={() => handleSelectTeam(game.id, game.away_team_id)}
            >
              <span className="team-name">{game.away_team_name}</span>
              <span className="open-spread" id="away">
                (Open: {game.away_open_spread}
              </span>{' '}
              <span className="curr-spread" id="away">
                Current: {game.away_curr_spread})
              </span>
            </div>
          </div>
        ))
      ) : (
        <p>No games available for this week.</p>
      )}
      <button onClick={handleSubmitPicks}>Submit Picks</button>
    </div>
  );
};

export default Picksheet;
