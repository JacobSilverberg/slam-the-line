import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import getUserId from '../services/getUserId';
import fetchUserLeagues from '../services/fetchUserLeagues';

const LeagueDropdown = ({ renderType = 'dropdown' }) => {
  const [leagues, setLeagues] = useState([]);
  const userId = getUserId();

  useEffect(() => {
    const getLeagues = async () => {
      const leaguesData = await fetchUserLeagues(userId);
      setLeagues(leaguesData);
    };

    getLeagues();
  }, [userId]);

  if (renderType === 'dropdown') {
    return (
      <div className="dropdown">
        <span>LEAGUES</span>
        <div className="dropdown-content">
          {leagues.length > 0 ? (
            leagues.map((league) => (
              <Link key={league.league_id} to={`/league/${league.league_id}`}>
                {league.league_name}
              </Link>
            ))
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>
    );
  } else if (renderType === 'list') {
    return (
      <ul className="league-list">
        {leagues.length > 0 ? (
          leagues.map((league) => (
            <li key={league.league_id}>
              <Link to={`/league/${league.league_id}`}>{league.league_name}</Link>
            </li>
          ))
        ) : (
          <p>You are not currently in any leagues. <Link to="/createleague">Create one now!</Link></p>
        )}
      </ul>
    );
  }

  return null;
};

export default LeagueDropdown;
