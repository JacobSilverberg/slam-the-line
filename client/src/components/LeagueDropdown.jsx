import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import getUserId from '../services/getUserId';
import apiUrl from '../services/serverConfig';

const LeagueDropdown = () => {
  const [leagues, setLeagues] = useState([]);

  const userId = getUserId();

  useEffect(() => {
    const fetchGames = async () => {
      if (!userId) {
        return;
      }

      try {
        const response = await axios.get(
          `${apiUrl}/getuserleagues/${userId}`
        );
        setLeagues(response.data);
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };

    fetchGames(); // call fetchGames
  }, [userId]);

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
};

export default LeagueDropdown;
