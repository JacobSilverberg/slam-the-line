import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import apiUrl from '../services/serverConfig.js';

const CURRENT_NFL_YEAR = parseInt(import.meta.env.VITE_NFL_YEAR || '2025', 10);

const CreateLeague = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [gamesSelectMax, setGamesSelectMax] = useState('');
  const [gamesSelectMin, setGamesSelectMin] = useState('');
  const [name, setName] = useState('');
  const [weeklyPoints, setWeeklyPoints] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const max = Number(gamesSelectMax);
    const min = Number(gamesSelectMin);
    if (max < min) { setError('Max games must be >= min games.'); return; }

    try {
      const res = await axios.post(`${apiUrl}/createleague`, {
        gamesSelectMax: max, gamesSelectMin: min, name, sport: 'nfl', type: 'league', weeklyPoints, year: CURRENT_NFL_YEAR,
      });
      const leagueId = res.data.id;
      await axios.post(`${apiUrl}/leagueregistration/${leagueId}/users/${user!.userId}`, {
        league_role: 'commish', team_name: teamName,
      });
      navigate(`/league/${leagueId}`);
    } catch (err: any) {
      setError(err.response?.data?.msg || err.message || 'Error creating league.');
    }
  };

  return (
    <div>
      <h1>Create Fantasy Football League</h1>
      <form onSubmit={handleSubmit}>
        <label>Games Select Max: <input type="number" value={gamesSelectMax} onChange={(e) => setGamesSelectMax(e.target.value)} required /></label><br />
        <label>Games Select Min: <input type="number" value={gamesSelectMin} onChange={(e) => setGamesSelectMin(e.target.value)} required /></label><br />
        <label>League Name: <input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></label><br />
        <label>Weekly Points: <input type="number" value={weeklyPoints} onChange={(e) => setWeeklyPoints(e.target.value)} required /></label><br />
        <label>Team Name: <input type="text" placeholder="Team Name" value={teamName} onChange={(e) => setTeamName(e.target.value)} required /></label><br />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Create League</button>
      </form>
    </div>
  );
};

export default CreateLeague;
