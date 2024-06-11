import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const LeagueDropdown = () => {
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/getuserleagues/9`
        );
        setLeagues(response.data);
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };

    fetchGames(); // call fetchGames
  }, []);

  return (
    <div className="dropdown">
      <span>LEAGUES</span>
      <div className="dropdown-content">
        {leagues.map((league) => (
          <Link key={league.league_id} to={`/league/${league.league_id}`}>
            {league.league_name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LeagueDropdown;
