import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Topbar from '../components/Topbar.jsx';
import apiUrl from '../services/serverConfig';

const League = () => {
  const { leagueId } = useParams();
  const [leagueInfo, setLeagueInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeagueInfo = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/leagueinfo/${leagueId}`
        );
        setLeagueInfo(response.data.league[0]);
      } catch (error) {
        console.error('Error fetching league data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagueInfo();
  }, [leagueId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-container">
      <Topbar leagueId={leagueId} />
      <div className="page-content">
        <h1>{leagueInfo.name}</h1>
        <p>
          <strong>Sport:</strong> {leagueInfo.sport}
        </p>
        <p>
          <strong>Year:</strong> {leagueInfo.year}
        </p>
        <p>
          <strong>Weekly Points:</strong> {leagueInfo.weekly_points}
        </p>
        <p>
          <strong>Minimum Game Selection:</strong> {leagueInfo.games_select_min}
        </p>
        <p>
          <strong>Maximum Game Selection:</strong> {leagueInfo.games_select_max}
        </p>
      </div>
    </div>
  );
};

export default League;
