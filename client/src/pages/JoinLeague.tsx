import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import apiUrl from '../services/serverConfig.js';

const JoinLeague = () => {
  const { user } = useContext(AuthContext);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm) return;
    axios.get(`${apiUrl}/searchleagues?query=${searchTerm}`)
      .then((res) => setLeagues(res.data))
      .catch(() => setLeagues([]));
  }, [searchTerm]);

  const handleRegistration = () => {
    if (!selectedLeagueId || !teamName || !user) {
      alert('Please select a league and enter a team name.');
      return;
    }
    axios.post(`${apiUrl}/leagueregistration/${selectedLeagueId}/users/${user.userId}`, {
      league_role: 'owner',
      team_name: teamName,
    })
      .then(() => navigate(`/league/${selectedLeagueId}`))
      .catch((err) => alert(err.response?.data?.msg || 'Error registering for the league.'));
  };

  return (
    <div className="home">
      <h1>Join a League</h1>
      {selectedLeagueId ? (
        <>
          <h2>League Selected: {leagues.find((l) => l.id === selectedLeagueId)?.name}</h2>
          <input className="cta-input" type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Enter your team name" />
          <button className="cta-button" onClick={handleRegistration}>Register</button>
        </>
      ) : (
        <>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search for a league" />
          <ul className="league-list">
            {leagues.length > 0 ? leagues.map((league) => (
              <li className="league-li" key={league.id}>
                <button onClick={() => setSelectedLeagueId(league.id)}>{league.name}</button>
              </li>
            )) : <p>No leagues found.</p>}
          </ul>
        </>
      )}
    </div>
  );
};

export default JoinLeague;
