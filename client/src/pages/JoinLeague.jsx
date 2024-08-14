import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import getUserId from '../services/getUserId';
import apiUrl from '../services/serverConfig';

const JoinLeague = () => {
  const [leagues, setLeagues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState(null);
  const [teamName, setTeamName] = useState('');
  const userId = getUserId();
  const navigate = useNavigate(); // Initialize the useNavigate hook

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await axios.get(`${apiUrl}/searchleagues?query=${searchTerm}`);
        setLeagues(response.data);
      } catch (error) {
        console.error('Error fetching leagues:', error);
      }
    };

    if (searchTerm) {
      fetchLeagues();
    }
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLeagueSelection = (leagueId) => {
    setSelectedLeagueId(leagueId);
  };

  const handleRegistration = () => {
    if (!selectedLeagueId || !teamName) {
      alert('Please select a league and enter a team name.');
      return;
    }

    axios
      .post(
        `${apiUrl}/leagueregistration/${selectedLeagueId}/users/${userId}`,
        {
          league_role: 'owner',
          team_name: teamName,
        }
      )
      .then((res) => {
        console.log(res.data);
        alert('Successfully registered for the league!');
        navigate(`/league/${selectedLeagueId}`); // Redirect to the league home page
      })
      .catch((err) => {
        console.error(err);
        alert('Error registering for the league.');
      });
  };

  return (
    <div>
      <h1>Join a League</h1>
      {selectedLeagueId ? (
        <>
          <h2>League Selected: {leagues.find(league => league.id === selectedLeagueId)?.name}</h2>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter your team name"
          />
          <button onClick={handleRegistration}>Register</button>
        </>
      ) : (
        <>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search for a league"
          />
          <ul>
            {leagues.length > 0 ? (
              leagues.map((league) => (
                <li key={league.id}>
                  <button onClick={() => handleLeagueSelection(league.id)}>
                    {league.name}
                  </button>
                </li>
              ))
            ) : (
              <p>No leagues found.</p>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default JoinLeague;
