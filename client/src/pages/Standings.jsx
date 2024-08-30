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
        setStandings(response.data);
      } catch (error) {
        console.error('Error fetching league standings:', error);
      }
    };

    fetchStandings();
  }, [leagueId]);

  const sortedStandings = [...standings].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
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
              <th onClick={() => requestSort('perfect_weeks')}>
                Perfect Weeks
              </th>
              <th onClick={() => requestSort('overdog_correct')}>
                Overdog Correct
              </th>
              <th onClick={() => requestSort('underdog_correct')}>
                Underdog Correct
              </th>
              <th onClick={() => requestSort('curr_streak')}>Current Streak</th>
              <th onClick={() => requestSort('max_streak')}>Max Streak</th>
            </tr>
          </thead>
          <tbody>
            {sortedStandings.map((standing) => (
              <tr key={standing.user_id}>
                <td>{standing.team_name}</td>
                <td>{standing.total_points}</td>
                <td>{standing.perfect_weeks}</td>
                <td>{standing.overdog_correct}</td>
                <td>{standing.underdog_correct}</td>
                <td>{standing.curr_streak}</td>
                <td>{standing.max_streak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Standings;
