import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Topbar from '../components/Topbar.jsx';
import apiUrl from '../services/serverConfig';

const Pickgrid = () => {
  const { leagueId } = useParams();
  const [users, setUsers] = useState([]);
  const [userSelections, setUserSelections] = useState({});
  const [games, setGames] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getusersinleague/${leagueId}`);
        console.log('Fetched users:', response.data);
        setUsers(response.data);

        const selections = {};
        for (const user of response.data) {
          try {
            const picksResponse = await axios.get(`${apiUrl}/userselections/${leagueId}/${user.user_id}`);
            console.log(`Selections for user ${user.user_id}:`, picksResponse.data.league);
            selections[user.user_id] = picksResponse.data.league || [];
          } catch (error) {
            console.error(`Error fetching selections for user ${user.user_id}:`, error);
            selections[user.user_id] = [];
          }
        }
        console.log('All selections:', selections);
        setUserSelections(selections);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    const fetchGames = async (week) => {
      try {
        const response = await axios.get(`${apiUrl}/games/${week}`);
        return response.data.reduce((acc, game) => {
          acc[game.id] = game;
          return acc;
        }, {});
      } catch (error) {
        console.error(`Error fetching games for week ${week}:`, error);
        return {};
      }
    };

    const fetchAllData = async () => {
      setIsLoading(true);

      await fetchUsers();

      const allGames = {};
      for (let week = 1; week <= 18; week++) {
        allGames[week] = await fetchGames(week);
      }
      console.log('Fetched all games:', allGames);
      setGames(allGames);

      setIsLoading(false);
    };

    fetchAllData();
  }, [leagueId]);

  const getPicksForWeek = (userId, week) => {
    const selections = userSelections[userId];
    if (!selections || selections.length === 0) return [];

    const weekGames = games[week];
    if (!weekGames) return [];

    return selections
      .filter(selection => weekGames[selection.game_id])
      .map(pick => {
        const game = weekGames[pick.game_id];
        if (!game) return 'pending';

        if (game.game_started === 0) {
          return 'pending';
        }

        const teamName = game.home_team_id === pick.team_id ? game.home_team_name : game.away_team_name;
        return `${teamName} - ${pick.points}`;
      });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-container">
      <Topbar leagueId={leagueId} />
      <div className="page-content">
        <h1>User Picks Grid</h1>
        <table>
          <thead>
            <tr>
              <th>User</th>
              {Array.from({ length: 18 }, (_, i) => (
                <th key={i + 1}>Week {i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.team_name}</td>
                {Array.from({ length: 18 }, (_, i) => (
                  <td key={i + 1}>
                    {getPicksForWeek(user.user_id, i + 1).map((pick, index) => (
                      <div key={index}>{pick}</div>
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Pickgrid;
