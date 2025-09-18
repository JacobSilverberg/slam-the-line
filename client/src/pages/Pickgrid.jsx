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
  const [leagueInfo, setLeagueInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch games for all weeks in parallel
  const fetchGames = async (leagueData) => {
    if (!leagueData) return;
    
    try {
      console.log('Fetching games for league year:', leagueData.year);
      const gamePromises = Array.from({ length: 18 }, (_, week) =>
        axios.get(`${apiUrl}/games/${week + 1}`)
      );
      const gameResponses = await Promise.all(gamePromises);

      // Consolidate games into one object where games are stored by week
      const allGames = gameResponses.reduce((acc, response, index) => {
        const week = index + 1;
        console.log(`Week ${week}: Found ${response.data.length} total games`);
        
        // Filter games by nfl_year === league.year
        const filteredGames = response.data.filter(
          (game) => game.nfl_year === leagueData.year
        );
        console.log(`Week ${week}: After filtering by year ${leagueData.year}: ${filteredGames.length} games`);
        
        acc[week] = filteredGames.reduce((gameAcc, game) => {
          gameAcc[game.id] = game;
          return gameAcc;
        }, {});
        return acc;
      }, {});

      console.log('Final games object:', allGames);
      setGames(allGames);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  // Fetch league info
  const fetchLeagueInfo = async () => {
    try {
      console.log('Fetching league info for leagueId:', leagueId);
      const response = await axios.get(`${apiUrl}/leagueinfo/${leagueId}`);
      console.log('League info response:', response.data);
      const leagueData = response.data.league[0];
      console.log('League data:', leagueData);
      setLeagueInfo(leagueData);
      return leagueData;
    } catch (error) {
      console.error('Error fetching league data:', error);
      return null;
    }
  };

  // Fetch users in the league
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiUrl}/getusersinleague/${leagueId}`);
      setUsers(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  // Fetch selections for each user
  const fetchUserSelections = async (users) => {
    try {
      console.log('Fetching user selections for users:', users);
      const selectionPromises = users.flatMap((user) => {
        return Array.from({ length: 18 }, (_, week) =>
          axios
            .get(
              `${apiUrl}/userselections/${leagueId}/${user.user_id}/${week + 1}`
            )
            .then((response) => {
              console.log(`User ${user.user_id} Week ${week + 1}: Found ${response.data.league?.length || 0} selections`);
              return {
                userId: user.user_id,
                week: week + 1,
                selections: response.data.league || [],
              };
            })
            .catch((error) => {
              console.log(`User ${user.user_id} Week ${week + 1}: Error fetching selections:`, error.message);
              return {
                userId: user.user_id,
                week: week + 1,
                selections: [],
              };
            })
        );
      });

      const resolvedSelections = await Promise.all(selectionPromises);

      // Organize selections into a structured object
      const organizedSelections = resolvedSelections.reduce(
        (acc, { userId, week, selections }) => {
          if (!acc[userId]) {
            acc[userId] = {};
          }
          acc[userId][week] = selections;
          return acc;
        },
        {}
      );

      console.log('Organized user selections:', organizedSelections);
      setUserSelections(organizedSelections);
    } catch (error) {
      console.error('Error fetching user selections:', error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);

      // Fetch league info first
      const league = await fetchLeagueInfo();
      if (league) {
        await fetchGames(league); // Pass league data directly
      }

      const fetchedUsers = await fetchUsers(); // Wait for users to be fetched first
      if (fetchedUsers.length > 0) {
        await fetchUserSelections(fetchedUsers); // Fetch selections only after users are fetched
      }

      setIsLoading(false);
    };

    fetchAllData();
  }, [leagueId]);

  const getPicksForWeek = (userId, week) => {
    const selections = userSelections[userId]?.[week] || [];
    const weekGames = games[week];
    
    console.log(`getPicksForWeek - User ${userId}, Week ${week}:`, {
      selections: selections.length,
      weekGames: weekGames ? Object.keys(weekGames).length : 0,
      gamesObject: games,
      hasGames: Object.keys(games).length
    });
    
    if (!weekGames) {
      console.log(`No games found for week ${week}. Total games object:`, games);
      return [];
    }

    return selections
      .filter((selection) => weekGames[selection.game_id])
      .map((pick) => {
        const game = weekGames[pick.game_id];
        if (!game) return { status: 'pending', content: 'Pending' };

        let className = '';
        if (game.game_started === 0) {
          return { status: 'pending', content: 'Pending' };
        } else if (game.game_completed === 1) {
          const isHomeTeam = game.home_team_id === pick.team_id;
          const isAwayTeam = game.away_team_id === pick.team_id;

          if (game.spread_winner === 'home') {
            className = isHomeTeam ? 'winner' : 'loser';
          } else if (game.spread_winner === 'away') {
            className = isAwayTeam ? 'winner' : 'loser';
          } else if (game.spread_winner === 'push') {
            className = 'push';
          }
        }

        const teamName =
          game.home_team_id === pick.team_id
            ? game.home_team_name
            : game.away_team_name;

        return {
          status: className || 'game-started',
          content: `${teamName} - ${pick.points}`,
        };
      });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-container">
      <Topbar leagueId={leagueId} />
      <div className="page-content">
        <h1>User Picks Grid - {leagueInfo?.year} Season</h1>
        <div className="table-container">
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
                      <div key={index} className={pick.status}>
                        {pick.content}
                      </div>
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pickgrid;
