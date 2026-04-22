import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import Topbar from '../components/Topbar.jsx';
import apiUrl from '../services/serverConfig.js';

type SortKey = 'total_points' | 'picks_correct' | 'max_streak' | 'curr_streak' | 'perfect_weeks' | 'overdog_correct' | 'underdog_correct' | 'team_name';

const Standings = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useContext(AuthContext);
  const [standings, setStandings] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' }>({
    key: 'total_points',
    direction: 'descending',
  });

  useEffect(() => {
    axios.get(`${apiUrl}/getleaguestandings/${leagueId}`)
      .then((res) => {
        setStandings(res.data.map((s: any) => ({
          ...s,
          picks_correct: Number(s.overdog_correct) + Number(s.underdog_correct),
        })));
      })
      .catch((err) => console.error('Error fetching standings:', err));
  }, [leagueId]);

  const sortedStandings = [...standings].sort((a, b) => {
    const aVal = Number(a[sortConfig.key]);
    const bVal = Number(b[sortConfig.key]);
    if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  const cols: { key: SortKey; label: string }[] = [
    { key: 'team_name', label: 'Team Name' },
    { key: 'total_points', label: 'Total Points' },
    { key: 'picks_correct', label: 'Picks Correct' },
    { key: 'max_streak', label: 'Max Streak' },
    { key: 'curr_streak', label: 'Current Streak' },
    { key: 'perfect_weeks', label: 'Perfect Weeks' },
    { key: 'overdog_correct', label: 'Favorites Correct' },
    { key: 'underdog_correct', label: 'Underdogs Correct' },
  ];

  return (
    <div className="main-container">
      <Topbar leagueId={leagueId} />
      <div className="page-content">
        <h1>League Standings</h1>
        <div className="table-container">
          <table>
            <thead>
              <tr>{cols.map((c) => <th key={c.key} onClick={() => requestSort(c.key)}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {sortedStandings.map((s) => (
                <tr key={s.user_id} className={s.user_id === user?.userId ? 'current-user' : ''}>
                  <td>{s.team_name}</td>
                  <td>{Number.isInteger(Number(s.total_points)) ? Number(s.total_points) : Number(s.total_points).toFixed(1)}</td>
                  <td>{Number(s.picks_correct)}</td>
                  <td>{Number(s.max_streak)}</td>
                  <td>{Number(s.curr_streak)}</td>
                  <td>{Number(s.perfect_weeks)}</td>
                  <td>{Number(s.overdog_correct)}</td>
                  <td>{Number(s.underdog_correct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Standings;
