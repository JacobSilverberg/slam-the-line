import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Topbar from '../components/Topbar.jsx';
import apiUrl from '../services/serverConfig.js';

const Commissioner = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const [leagueInfo, setLeagueInfo] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [games, setGames] = useState<any[]>([]);
  const [picks, setPicks] = useState([{ teamId: '', points: '' }]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${apiUrl}/leagueinfo/${leagueId}`),
      axios.get(`${apiUrl}/getusersinleague/${leagueId}`),
    ]).then(([leagueRes, usersRes]) => {
      setLeagueInfo(leagueRes.data.league[0]);
      setUsers(usersRes.data);
    }).catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [leagueId]);

  useEffect(() => {
    if (!selectedWeek || !leagueInfo) return;
    axios.get(`${apiUrl}/games/${selectedWeek}`)
      .then((res) => setGames(res.data.filter((g: any) => g.nfl_year === leagueInfo.year)))
      .catch((err) => console.error(err));
  }, [selectedWeek, leagueInfo]);

  const handlePickChange = (index: number, field: string, value: string) => {
    const next = [...picks];
    next[index] = { ...next[index], [field]: value };
    setPicks(next);
  };

  const handleSubmitPicks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedWeek || picks.some((p) => !p.teamId || !p.points)) {
      alert('Please ensure all picks have a team and points selected.');
      return;
    }
    const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const formData = picks.map((pick) => {
      const game = games.find((g) => g.home_team_id === parseInt(pick.teamId) || g.away_team_id === parseInt(pick.teamId));
      return { gameId: game?.id, teamId: pick.teamId, points: pick.points, createdAt: ts, updatedAt: ts, week: selectedWeek };
    });
    try {
      try { await axios.delete(`${apiUrl}/removeuserselections/${leagueId}/${selectedUser}/${selectedWeek}`); } catch { /* none to delete */ }
      await axios.post(`${apiUrl}/submitpicks/`, { picks: formData, userId: selectedUser, leagueId });
      alert('Picks submitted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.msg || 'Error submitting picks.');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="main-container">
      <Topbar leagueId={leagueId} />
      <div className="page-content">
        <h1>{leagueInfo.name}</h1>
        <h2>Commissioner Page - {leagueInfo.year} Season</h2>
        <h3>Make Game Selection</h3>
        <label htmlFor="user-select"><strong>Select a User:</strong></label>
        <select id="user-select" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">--Select a User--</option>
          {users.map((u) => <option key={u.user_id} value={u.user_id}>{u.team_name}</option>)}
        </select>
        <h3>Select Week</h3>
        <select id="week-select" value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)}>
          <option value="">--Select a Week--</option>
          {Array.from({ length: 18 }, (_, i) => i + 1).map((w) => <option key={w} value={w}>Week {w}</option>)}
        </select>
        <h3>Picks</h3>
        {picks.map((pick, index) => (
          <div key={index}>
            <select value={pick.teamId} onChange={(e) => handlePickChange(index, 'teamId', e.target.value)} disabled={!selectedWeek}>
              <option value="">--Select a Team--</option>
              {games.map((game) => (
                <React.Fragment key={game.id}>
                  <option value={game.home_team_id}>{game.home_team_name} (Home)</option>
                  <option value={game.away_team_id}>{game.away_team_name} (Away)</option>
                </React.Fragment>
              ))}
            </select>
            <select value={pick.points} onChange={(e) => handlePickChange(index, 'points', e.target.value)} disabled={!pick.teamId}>
              <option value="">--Select Points--</option>
              {Array.from({ length: leagueInfo.weekly_points }, (_, i) => i + 1).map((p) => <option key={p} value={p}>{p} Points</option>)}
            </select>
            <button type="button" onClick={() => setPicks(picks.filter((_, i) => i !== index))}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => setPicks([...picks, { teamId: '', points: '' }])}>Add Pick</button>
        <div><button onClick={handleSubmitPicks}>Submit Picks</button></div>
      </div>
    </div>
  );
};

export default Commissioner;
