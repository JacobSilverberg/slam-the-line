import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Topbar from '../components/Topbar.jsx';
import apiUrl from '../services/serverConfig';

const Commissioner = () => {
  const { leagueId } = useParams();
  const [leagueInfo, setLeagueInfo] = useState(null);
  const [users, setUsers] = useState([]); // State to hold the list of users in the league
  const [selectedUser, setSelectedUser] = useState(''); // State to hold the selected user
  const [selectedWeek, setSelectedWeek] = useState(''); // State to hold the selected week
  const [games, setGames] = useState([]); // State to hold the list of games
  const [picks, setPicks] = useState([{ teamId: '', points: '' }]); // State to hold multiple picks
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeagueInfo = async () => {
      try {
        const response = await axios.get(`${apiUrl}/leagueinfo/${leagueId}`);
        setLeagueInfo(response.data.league[0]);
      } catch (error) {
        console.error('Error fetching league data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUsersInLeague = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/getusersinleague/${leagueId}`
        );
        setUsers(response.data); // Set the list of users
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchLeagueInfo();
    fetchUsersInLeague();
  }, [leagueId]);

  useEffect(() => {
    const fetchGames = async () => {
      if (selectedWeek && leagueInfo) {
        try {
          const response = await axios.get(`${apiUrl}/games/${selectedWeek}`);
          // Filter games by nfl_year === league.year
          const filteredGames = response.data.filter(
            (game) => game.nfl_year === leagueInfo.year
          );
          setGames(filteredGames); // Set the filtered list of games
        } catch (error) {
          console.error('Error fetching games data:', error);
        }
      }
    };

    fetchGames(); // Fetch games data when a week is selected
  }, [selectedWeek, leagueInfo]);

  const handleUserChange = (event) => {
    setSelectedUser(event.target.value); // Update the selected user when the dropdown changes
  };

  const handleWeekChange = (event) => {
    setSelectedWeek(event.target.value); // Update the selected week when the dropdown changes
  };

  const handlePickChange = (index, field, value) => {
    const newPicks = [...picks];
    newPicks[index][field] = value;
    setPicks(newPicks);
  };

  const addPick = () => {
    setPicks([...picks, { teamId: '', points: '' }]);
  };

  const removePick = (index) => {
    const newPicks = picks.filter((_, i) => i !== index);
    setPicks(newPicks);
  };

  const handleSubmitPicks = async (e) => {
    e.preventDefault();

    // Ensure a user, week, and picks have been selected
    if (
      !selectedUser ||
      !selectedWeek ||
      picks.some((pick) => !pick.teamId || !pick.points)
    ) {
      alert('Please ensure all picks have a team and points selected.');
      return;
    }

    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updatedAt = createdAt;

    // Debugging: Log the picks array to check teamId values
    // console.log('Picks:', picks);

    // Map the form data using the gameId from the games list
    const formData = picks.map((pick) => {
      // Find the matching game based on teamId
      const game = games.find(
        (g) =>
          g.home_team_id === parseInt(pick.teamId) ||
          g.away_team_id === parseInt(pick.teamId)
      );

      if (!game) {
        console.error('No matching game found for teamId:', pick.teamId);
      }

      // console.log('Mapped game:', game); // Log the matched game for debugging

      return {
        gameId: game?.id, // Use game.id for gameId
        teamId: pick.teamId,
        points: pick.points,
        createdAt,
        updatedAt,
        week: selectedWeek,
      };
    });

    // console.log('Form Data:', formData); // Log formData for debugging

    try {
      // Attempt to delete existing selections
      try {
        await axios.delete(
          `${apiUrl}/removeuserselections/${leagueId}/${selectedUser}/${selectedWeek}`
        );
      } catch (err) {
        if (err.response && err.response.status === 404) {
          console.warn('No existing selections found to delete, continuing...');
        } else {
          throw err; // Re-throw other errors
        }
      }

      // Submit new selections
      await axios.post(`${apiUrl}/submitpicks/`, {
        picks: formData, // Submit the formData as an array
        userId: selectedUser, // Use the selectedUser ID
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-container">
      <Topbar leagueId={leagueId} />
      <div className="page-content">
        <h1>{leagueInfo.name}</h1>
        <h2>Commissioner Page - {leagueInfo.year} Season</h2>

        {/* Dropdown for selecting a user */}
        <h3>Make Game Selection</h3>
        <label htmlFor="user-select">
          <strong>Select a User:</strong>
        </label>
        <select
          id="user-select"
          value={selectedUser}
          onChange={handleUserChange}
        >
          <option value="">--Select a User--</option>
          {users.map((user) => (
            <option key={user.user_id} value={user.user_id}>
              {user.team_name}
            </option>
          ))}
        </select>

        {/* Dropdown for selecting a week */}
        <h3>Select Week</h3>
        <label htmlFor="week-select">
          <strong>Select a Week:</strong>
        </label>
        <select
          id="week-select"
          value={selectedWeek}
          onChange={handleWeekChange}
        >
          <option value="">--Select a Week--</option>
          {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => (
            <option key={week} value={week}>
              Week {week}
            </option>
          ))}
        </select>

        {/* Multiple picks input */}
        <h3>Picks</h3>
        {picks.map((pick, index) => (
          <div key={index}>
            <label htmlFor={`team-select-${index}`}>
              <strong>Select a Team:</strong>
            </label>
            <select
              id={`team-select-${index}`}
              value={pick.teamId}
              onChange={(e) =>
                handlePickChange(index, 'teamId', e.target.value)
              }
              disabled={!selectedWeek} // Disable the dropdown until a week is selected
            >
              <option value="">--Select a Team--</option>
              {games.map((game) => (
                <React.Fragment key={game.id}>
                  <option
                    key={`home-${game.home_team_id}`}
                    value={game.home_team_id}
                  >
                    {game.home_team_name} (Home)
                  </option>
                  <option
                    key={`away-${game.away_team_id}`}
                    value={game.away_team_id}
                  >
                    {game.away_team_name} (Away)
                  </option>
                </React.Fragment>
              ))}
            </select>

            <label htmlFor={`points-select-${index}`}>
              <strong>Select Points:</strong>
            </label>
            <select
              id={`points-select-${index}`}
              value={pick.points}
              onChange={(e) =>
                handlePickChange(index, 'points', e.target.value)
              }
              disabled={!pick.teamId} // Disable the dropdown until a team is selected
            >
              <option value="">--Select Points--</option>
              {Array.from(
                { length: leagueInfo.weekly_points },
                (_, i) => i + 1
              ).map((points) => (
                <option key={points} value={points}>
                  {points} Points
                </option>
              ))}
            </select>

            <button type="button" onClick={() => removePick(index)}>
              Remove Pick
            </button>
          </div>
        ))}

        <button type="button" onClick={addPick}>
          Add Another Pick
        </button>

        {/* Submit button */}
        <div>
          <button onClick={handleSubmitPicks}>Submit Picks</button>
        </div>
      </div>
    </div>
  );
};

export default Commissioner;
