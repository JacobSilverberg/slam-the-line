import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import Topbar from '../components/Topbar.jsx';
import apiUrl from '../services/serverConfig.js';

const Pickgrid = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState<any[]>([]);
  const [userSelections, setUserSelections] = useState<Record<number, Record<number, any[]>>>({});
  const [games, setGames] = useState<Record<number, Record<number, any>>>({});
  const [leagueInfo, setLeagueInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [leagueRes, usersRes] = await Promise.all([
          axios.get(`${apiUrl}/leagueinfo/${leagueId}`),
          axios.get(`${apiUrl}/getusersinleague/${leagueId}`),
        ]);
        const league = leagueRes.data.league[0];
        setLeagueInfo(league);

        const gameResponses = await Promise.all(
          Array.from({ length: 18 }, (_, i) => axios.get(`${apiUrl}/games/${i + 1}`))
        );
        const allGames = gameResponses.reduce<Record<number, Record<number, any>>>((acc, res, i) => {
          const week = i + 1;
          acc[week] = res.data
            .filter((g: any) => g.nfl_year === league.year)
            .reduce((ga: any, g: any) => { ga[g.id] = g; return ga; }, {});
          return acc;
        }, {});
        setGames(allGames);

        const fetchedUsers = usersRes.data;
        setUsers(fetchedUsers);

        const selectionResults = await Promise.all(
          fetchedUsers.flatMap((u: any) =>
            Array.from({ length: 18 }, (_, i) =>
              axios.get(`${apiUrl}/userselections/${leagueId}/${u.user_id}/${i + 1}`)
                .then((res) => ({ userId: u.user_id, week: i + 1, selections: res.data.league || [] }))
                .catch(() => ({ userId: u.user_id, week: i + 1, selections: [] }))
            )
          )
        );

        const organized = selectionResults.reduce<Record<number, Record<number, any[]>>>((acc, { userId, week, selections }) => {
          if (!acc[userId]) acc[userId] = {};
          acc[userId][week] = selections;
          return acc;
        }, {});
        setUserSelections(organized);
      } catch (err) {
        console.error('Error fetching pickgrid data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [leagueId]);

  const getPicksForWeek = (userId: number, week: number) => {
    const selections = userSelections[userId]?.[week] || [];
    const weekGames = games[week];
    if (!weekGames) return [];

    return selections
      .filter((s) => weekGames[s.game_id])
      .map((pick) => {
        const game = weekGames[pick.game_id];
        if (!game) return { status: 'pending', content: 'Pending' };
        if (game.game_started === 0) return { status: 'pending', content: 'Pending' };

        let className = '';
        if (game.game_completed === 1) {
          const isHome = game.home_team_id === pick.team_id;
          const isAway = game.away_team_id === pick.team_id;
          if (game.spread_winner === 'home') className = isHome ? 'winner' : 'loser';
          else if (game.spread_winner === 'away') className = isAway ? 'winner' : 'loser';
          else if (game.spread_winner === 'push') className = 'push';
        }

        const teamName = game.home_team_id === pick.team_id ? game.home_team_name : game.away_team_name;
        return { status: className || 'game-started', content: `${teamName} - ${pick.points}` };
      });
  };

  if (isLoading) return <div>Loading...</div>;

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
                {Array.from({ length: 18 }, (_, i) => <th key={i + 1}>Week {i + 1}</th>)}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} className={u.user_id === user?.userId ? 'current-user' : ''}>
                  <td>{u.team_name}</td>
                  {Array.from({ length: 18 }, (_, i) => (
                    <td key={i + 1}>
                      {getPicksForWeek(u.user_id, i + 1).map((pick, idx) => (
                        <div key={idx} className={pick.status}>{pick.content}</div>
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
