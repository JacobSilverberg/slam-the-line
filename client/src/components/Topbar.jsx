import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import apiUrl from '../services/serverConfig'; // Adjust path as needed
import getUserId from '../services/getUserId'; // Assuming you have this function to get the user ID

const TopBar = () => {
  const { leagueId } = useParams();
  const [isCommish, setIsCommish] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const userId = getUserId(); // Get the current user ID
        const response = await axios.get(`${apiUrl}/getuserleaguerole/${leagueId}/user/${userId}`);
        if (response.data && response.data.league_role === 'commish') {
          setIsCommish(true);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };

    checkUserRole();
  }, [leagueId]);

  return (
    <div className="top-bar">
      <div className="container">
        <div className="links">
          <Link className="link" to={`/league/${leagueId}/picksheet`}>
            <h6>Picksheet</h6>
          </Link>
          <Link className="link" to={`/league/${leagueId}/standings`}>
            <h6>Standings</h6>
          </Link>
          <Link className="link" to={`/league/${leagueId}/pickgrid`}>
            <h6>Pick Grid</h6>
          </Link>
          <Link className="link" to={`/league/${leagueId}`}>
            <h6>League Details</h6>
          </Link>
          {isCommish && (
            <Link className="link" to={`/league/${leagueId}/commissioner`}>
              <h6>Commissioner</h6>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
