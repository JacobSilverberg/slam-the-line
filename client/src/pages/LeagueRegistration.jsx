import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const LeagueRegistration = () => {
  const { leagueId, userId } = useParams();
  const [teamName, setTeamName] = useState('');

  const handleRegistration = () => {
    axios
      .post(
        `http://localhost:3000/leagueregistration/${leagueId}/users/${userId}`,
        {
          league_role: 'owner',
          team_name: teamName,
        }
      )
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div>
      <h1>League Registration</h1>
      <input
        type="text"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        placeholder="Enter your team name"
      />
      <button onClick={handleRegistration}>Register</button>
    </div>
  );
};

export default LeagueRegistration;
