import React from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

const League = () => {
  const { leagueId } = useParams();

  return (
    <div className="main-container">
      <Sidebar leagueId={leagueId} />
      <div className="page-content">
        <h1>League ID: {leagueId}</h1>
        <div>League</div>
      </div>
    </div>
  );
};

export default League;
