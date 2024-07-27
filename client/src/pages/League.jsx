import React from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

const League = () => {
  const { leagueId } = useParams();

  return (
    <div className="league-page">
      <Sidebar leagueId={leagueId} />
      <div className="league-content">
        <h1>League ID: {leagueId}</h1>
        <div>League</div>
      </div>
    </div>
  );
};

export default League;
