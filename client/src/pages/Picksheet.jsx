import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import getUserId from '../services/getUserId';
import { WeekContext } from '../context/WeekContext';
import Topbar from '../components/Topbar.jsx';
import apiUrl from '../services/serverConfig';

const Picksheet = () => {
  const { leagueId } = useParams();
  const { week } = useContext(WeekContext);
  const [games, setGames] = useState([]);
  const [leagueInfo, setLeagueInfo] = useState({});
  const [userSelections, setUserSelections] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState({});
  const [selectedCount, setSelectedCount] = useState(0);
  const [weeklyPoints, setWeeklyPoints] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingSelections, setHasExistingSelections] = useState(false);

  const userId = getUserId();

  // Fetch games for the current week
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get(`${apiUrl}/games/${week}`);
        setGames(response.data);
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };

    fetchGames();
  }, [week]);

  // Fetch league info and clear selections on league or week change
  useEffect(() => {
    const fetchLeagueInfo = async () => {
      try {
        const response = await axios.get(`${apiUrl}/leagueinfo/${leagueId}`);
        setLeagueInfo(response.data.league[0]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching league data:', error);
      }
    };

    // Reset selections and points when the week or league changes
    setSelectedTeam({});
    setWeeklyPoints({});
    setSelectedCount(0);
    fetchLeagueInfo();
  }, [leagueId, week]);

  // Fetch user selections and reset state based on the current week
  // Fetch user selections and reset state based on the current week
  useEffect(() => {
    const fetchUserSelections = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/userselections/${leagueId}/${userId}/${week}`
        );

        // Check if user has existing selections for this week
        const weekSelections = response.data.league.filter(
          (selection) => selection.week === week
        );
        if (weekSelections.length > 0) {
          setHasExistingSelections(true);

          const selections = weekSelections.reduce(
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
        } else {
          // Reset the state if no selections for the current week
          setSelectedTeam({});
          setWeeklyPoints({});
          setSelectedCount(0);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log('No selections found for the given user and league.');
          setSelectedTeam({});
          setWeeklyPoints({});
          setSelectedCount(0);
        } else {
          console.error('Error fetching user selections:', error);
        }
      }
    };

    // Only fetch selections if the week is defined and greater than 0
    if (week && week > 0) {
      fetchUserSelections();
    }
  }, [leagueId, userId, week]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleSelectTeam = (gameId, teamId) => {
    const game = games.find((g) => g.id === gameId);

    if (game.game_started) {
      alert('This game has already started, and you cannot make changes.');
      return;
    }

    setSelectedTeam((prev) => {
      if (prev[gameId] === teamId) {
        const updatedSelection = { ...prev };
        delete updatedSelection[gameId];

        // Remove the associated points when the game is deselected
        setWeeklyPoints((prevPoints) => {
          const updatedPoints = { ...prevPoints };
          delete updatedPoints[gameId];
          return updatedPoints;
        });

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
    const game = games.find((g) => g.id === gameId);

    if (game.game_started) {
      alert('This game has already started, and you cannot make changes.');
      return;
    }

    event.stopPropagation();

    const value = parseInt(event.target.value) || 0;

    // if (value < 1) {
    //   alert('You must allocate at least 1 point per selected game.');
    //   return;
    // }

    setWeeklyPoints({
      ...weeklyPoints,
      [gameId]: value,
    });
  };

  const handleSubmitPicks = async (e) => {
    e.preventDefault();

      // Disable the submit button after submission
    setIsSubmitting(true);

    const totalWeeklyPoints = Object.values(weeklyPoints).reduce(
      (a, b) => a + b,
      0
    );
    const selectedGamesCount = Object.keys(selectedTeam).length;

    if (totalWeeklyPoints !== leagueInfo.weekly_points) {
      alert(
        `Total weekly points must be equal to ${leagueInfo.weekly_points}.`
      );
      return;
    }

    if (selectedGamesCount < leagueInfo.games_select_min) {
      alert(`You must select at least ${leagueInfo.games_select_min} games.`);
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
      week: week,
    }));

    try {
      if (hasExistingSelections) {
        await axios.delete(
          `${apiUrl}/removeuserselections/${leagueId}/${userId}/${week}`
        );
      }

      await axios.post(`${apiUrl}/submitpicks/`, {
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
    } finally {
      setIsSubmitting(false); // Re-enable the button after submission is complete
    }
  };

  return (
    <div className="main-container">
      <Topbar leagueId={leagueId} />
      <div className="page-content">
        <h2>
          {leagueInfo.name}'s Week {week} Picksheet
        </h2>
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
        <button onClick={handleSubmitPicks} disabled={isSubmitting} className="submit-button">
          {isSubmitting ? 'Submitting...' : 'Submit Picks'}
        </button>
        <div className="game-container-wrapper">
          {Array.isArray(games) && games.length > 0 ? (
            games.map((game) => {
              const formatSpread = (spread) => {
                const num = parseFloat(spread);
                return num > 0 ? `+${num.toFixed(1)}` : num.toFixed(1);
              };

              return (
                <div className="game-container" key={game.id}>
                  <div className="game-info">
                    <div className="game-start-date">
                      {new Date(game.game_start_time).toLocaleDateString(
                        undefined,
                        {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </div>
                    <div className="game-start-time">
                      {new Date(game.game_start_time).toLocaleTimeString(
                        undefined,
                        {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        }
                      )}
                    </div>
                  </div>
                  <div
                    className={`team-button ${selectedTeam[game.id] === game.away_team_id ? 'selected' : ''} ${game.game_started ? 'disabled' : ''}`}
                    id="away"
                    onClick={() => handleSelectTeam(game.id, game.away_team_id)}
                  >
                    <span className="team-name">{game.away_team_name}</span>
                    <span className="curr-spread" id="away">
                      {formatSpread(game.away_curr_spread)}
                    </span>{' '}
                    <span className="open-spread" id="away">
                      (Open: {formatSpread(game.away_open_spread)})
                    </span>
                    {selectedTeam[game.id] === game.away_team_id &&
                      !game.game_started && (
                        <input
                          className="point-input"
                          type="number"
                          value={weeklyPoints[game.id] || ''}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleInputChange(game.id, e)}
                          placeholder="Points"
                        />
                      )}
                  </div>
                  <div
                    className={`team-button ${selectedTeam[game.id] === game.home_team_id ? 'selected' : ''} ${game.game_started ? 'disabled' : ''}`}
                    id="home"
                    onClick={() => handleSelectTeam(game.id, game.home_team_id)}
                  >
                    <span className="team-name">@ {game.home_team_name}</span>
                    <span className="curr-spread" id="home">
                      {formatSpread(game.home_curr_spread)}
                    </span>
                    <span className="open-spread" id="home">
                      (Open: {formatSpread(game.home_open_spread)})
                    </span>{' '}
                    {selectedTeam[game.id] === game.home_team_id &&
                      !game.game_started && (
                        <input
                          className="point-input"
                          type="number"
                          value={weeklyPoints[game.id] || ''}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleInputChange(game.id, e)}
                          placeholder="Points"
                        />
                      )}
                  </div>
                </div>
              );
            })
          ) : (
            <p>No games available for this week.</p>
          )}
        </div>
        <button onClick={handleSubmitPicks} disabled={isSubmitting} className="submit-button">
          {isSubmitting ? 'Submitting...' : 'Submit Picks'}
        </button>
      </div>
    </div>
  );
};

export default Picksheet;
