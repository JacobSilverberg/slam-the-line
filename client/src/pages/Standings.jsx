import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Topbar from '../components/Topbar.jsx';
import apiUrl from '../services/serverConfig';

const Standings = () => {
  const { leagueId } = useParams();
  const [standings, setStandings] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'total_points',
    direction: 'descending',
  });

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/getleaguestandings/${leagueId}`
        );
        const standingsWithPicksCorrect = response.data.map((standing) => ({
          ...standing,
          picks_correct:
            Number(standing.overdog_correct) +
            Number(standing.underdog_correct),
        }));
        setStandings(standingsWithPicksCorrect);
      } catch (error) {
        console.error('Error fetching league standings:', error);
      }      
    };

    fetchStandings();
  }, [leagueId]);

  const sortedStandings = [...standings].sort((a, b) => {
    const aValue = Number(a[sortConfig.key]);
    const bValue = Number(b[sortConfig.key]);

    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="main-container">
      <Topbar leagueId={leagueId} />
      <div className="page-content">
        <h1>League Standings</h1>
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('team_name')}>Team Name</th>
              <th onClick={() => requestSort('total_points')}>Total Points</th>
              <th onClick={() => requestSort('picks_correct')}>
                Picks Correct
              </th>
              <th onClick={() => requestSort('max_streak')}>Max Streak</th>
              <th onClick={() => requestSort('curr_streak')}>Current Streak</th>
              <th onClick={() => requestSort('perfect_weeks')}>
                Perfect Weeks
              </th>
              <th onClick={() => requestSort('overdog_correct')}>
                Favorites Correct
              </th>
              <th onClick={() => requestSort('underdog_correct')}>
                Underdogs Correct
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStandings.map((standing) => (
              <tr key={standing.user_id}>
                <td>{standing.team_name}</td>
                <td>
                  {Number.isInteger(Number(standing.total_points))
                    ? Number(standing.total_points)
                    : Number(standing.total_points).toFixed(1)}
                </td>
                <td>{Number(standing.picks_correct)}</td>
                <td>{Number(standing.max_streak)}</td>
                <td>{Number(standing.curr_streak)}</td>
                <td>{Number(standing.perfect_weeks)}</td>
                <td>{Number(standing.overdog_correct)}</td>
                <td>{Number(standing.underdog_correct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Standings;
