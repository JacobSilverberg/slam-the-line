import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import getUserId from '../services/getUserId';
import { WeekContext } from '../context/WeekContext';
import Sidebar from '../components/Sidebar.jsx';

const Picksheet = () => {
  const { leagueId } = useParams();
  const { week } = useContext(WeekContext);
  const [games, setGames] = useState([]);
  const [leagueInfo, setLeagueInfo] = useState({});
  const [userSelections, setUserSelections] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState({});
  const [selectedCount, setSelectedCount] = useState(0);
  const [weeklyPoints, setWeeklyPoints] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingSelections, setHasExistingSelections] = useState(false);

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

  useEffect(() => {
    const fetchLeagueInfo = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/leagueinfo/${leagueId}`
        );
        setLeagueInfo(response.data.league[0]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching league data:', error);
      }
    };
    fetchLeagueInfo();
  }, [leagueId]);

  useEffect(() => {
    const fetchUserSelections = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/userselections/${leagueId}/${userId}`
        );

        if (response.data && response.data.length > 0) {
          setHasExistingSelections(true);

          const selections = response.data.reduce(
            (acc, selection) => {
              acc.selectedTeam[selection.game_id] = selection.team_id;
              acc.weeklyPoints[selection.game_id] = selection.points;
              return acc;
            },
            { selectedTeam: {}, weeklyPoints: {} }
          );

          setSelectedTeam(selections.selectedTeam);
          setWeeklyPoints(selections.weeklyPoints);
          setSelectedCount(Object.keys(selections.selectedTeam).length);
        }
      } catch (error) {
        console.error('Error fetching user selections:', error);
      }
    };
    fetchUserSelections();
  }, [leagueId, userId]);

  useEffect(() => {
    console.log('Selected team:', selectedTeam);
    console.log('Weekly points:', weeklyPoints);
  }, [selectedTeam, weeklyPoints]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleSelectTeam = (gameId, teamId) => {
    setSelectedTeam((prev) => {
      if (prev[gameId] === teamId) {
        const updatedSelection = { ...prev };
        delete updatedSelection[gameId];
        setSelectedCount(Object.keys(updatedSelection).length);
        return updatedSelection;
      }

      if (Object.keys(prev).length >= leagueInfo.games_select_max) {
        return prev;
      }

      const updatedSelection = { ...prev, [gameId]: teamId };
      setSelectedCount(Object.keys(updatedSelection).length);
      return updatedSelection;
    });
  };

  const handleInputChange = (gameId, event) => {
    event.stopPropagation();
    setWeeklyPoints({
      ...weeklyPoints,
      [gameId]: parseInt(event.target.value) || 0,
    });
  };

  const handleSubmitPicks = async (e) => {
    e.preventDefault();

    const totalWeeklyPoints = Object.values(weeklyPoints).reduce(
      (a, b) => a + b,
      0
    );

    if (totalWeeklyPoints !== leagueInfo.weekly_points) {
      alert(
        `Total weekly points must be equal to ${leagueInfo.weekly_points}.`
      );
      return;
    }

    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updatedAt = createdAt;

    const selectedGames = games.filter(
      (game) => weeklyPoints[game.id] !== undefined
    );

    const formData = selectedGames.map((game) => ({
      gameId: game.id,
      teamId: selectedTeam[game.id],
      points: weeklyPoints[game.id],
      createdAt,
      updatedAt,
    }));

    try {
      if (hasExistingSelections) {
        await axios.delete(`http://localhost:3000/removeuserselections/${leagueId}/${userId}`);
      }

      await axios.post(`http://localhost:3000/submitpicks/`, {
        picks: formData,
        userId: userId,
        leagueId: leagueId,
      });

      alert('Picks submitted successfully!');
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
      <Sidebar leagueId={leagueId} />
      <div className="page-content">
      <h2>Week {week} Picksheet</h2>
      <p>
        Select between {leagueInfo.games_select_min} and{' '}
        {leagueInfo.games_select_max} games
      </p>
      <p>You have {leagueInfo.weekly_points} points to distribute.</p>
      <p>
        You have distributed{' '}
        {Object.values(weeklyPoints).reduce((a, b) => a + b, 0)} points.
      </p>
      <p>You have selected {selectedCount} games</p>
      {Array.isArray(games) && games.length > 0 ? (
        games.map((game) => (
          <div className="game-container" key={game.id}>
            <div
              className={`team-button ${selectedTeam[game.id] === game.home_team_id ? 'selected' : ''}`}
              id="home"
              onClick={() => handleSelectTeam(game.id, game.home_team_id)}
            >
              <span className="team-name">{game.home_team_name}</span>
              <span className="open-spread" id="home">
                (Open: {game.home_open_spread})
              </span>{' '}
              <span className="curr-spread" id="home">
                Current: {game.home_curr_spread})
              </span>
              {selectedTeam[game.id] === game.home_team_id && (
                <input
                  type="number"
                  value={weeklyPoints[game.id] || ''}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleInputChange(game.id, e)}
                />
              )}
            </div>

            <div
              className={`team-button ${selectedTeam[game.id] === game.away_team_id ? 'selected' : ''}`}
              id="away"
              onClick={() => handleSelectTeam(game.id, game.away_team_id)}
            >
              <span className="team-name">{game.away_team_name}</span>
              <span className="open-spread" id="away">
                (Open: {game.away_open_spread})
              </span>{' '}
              <span className="curr-spread" id="away">
                Current: {game.away_curr_spread})
              </span>
              {selectedTeam[game.id] === game.away_team_id && (
                <input
                  type="number"
                  value={weeklyPoints[game.id] || ''}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleInputChange(game.id, e)}
                />
              )}
            </div>
          </div>
        ))
      ) : (
        <p>No games available for this week.</p>
      )}
      <button onClick={handleSubmitPicks}>Submit Picks</button>
      </div>
    </div>
  );
};

export default Picksheet;
