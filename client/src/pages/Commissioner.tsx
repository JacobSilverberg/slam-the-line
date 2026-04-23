import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import LeagueTabBar from '../components/LeagueTabBar.tsx';
import apiUrl from '../services/serverConfig.ts';

const C = {
  bg: '#0c1628', card: '#152540', d2: '#1a2d4a',
  amb: '#f59e0b', txt: '#e2e8f0', mut: '#94a3b8', bor: '#1e3354',
  grn: '#10b981', red: '#ef4444',
} as const;
const FF = "'Barlow Condensed', sans-serif";
const FFb = "'Barlow', sans-serif";

const SEL: React.CSSProperties = {
  width: '100%', padding: '13px 14px',
  background: C.d2, border: `1px solid ${C.bor}`,
  borderRadius: 10, color: C.txt, fontSize: 15,
  fontFamily: FFb, outline: 'none', appearance: 'none',
  WebkitAppearance: 'none', boxSizing: 'border-box',
};

const Commissioner = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const [leagueInfo, setLeagueInfo] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [games, setGames] = useState<any[]>([]);
  const [picks, setPicks] = useState([{ teamId: '', points: '' }]);
  const [isLoading, setIsLoading] = useState(true);
  const [msg, setMsg] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedWeek || picks.some((p) => !p.teamId || !p.points)) {
      setMsg('Please complete all picks before submitting.');
      return;
    }
    const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const formData = picks.map((pick) => {
      const game = games.find((g) => g.home_team_id === parseInt(pick.teamId) || g.away_team_id === parseInt(pick.teamId));
      return { gameId: game?.id, teamId: pick.teamId, points: pick.points, createdAt: ts, updatedAt: ts, week: selectedWeek };
    });
    try {
      try { await axios.delete(`${apiUrl}/removeuserselections/${leagueId}/${selectedUser}/${selectedWeek}`); } catch { /* ok */ }
      await axios.post(`${apiUrl}/submitpicks/`, { picks: formData, userId: selectedUser, leagueId });
      setMsg('Picks submitted successfully!');
    } catch (err: any) {
      setMsg(err.response?.data?.msg || 'Error submitting picks.');
    }
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: FF }}>
      <div style={{
        background: 'linear-gradient(160deg, #1a3a7a 0%, #0e1e3d 100%)',
        padding: '20px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 99, background: 'rgba(129,140,248,0.08)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: C.amb, letterSpacing: 3, textTransform: 'uppercase', fontFamily: FFb, marginBottom: 2, position: 'relative', zIndex: 1 }}>
          {isLoading ? '' : leagueInfo?.name}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: -0.5, position: 'relative', zIndex: 1 }}>Commissioner</div>
      </div>

      {!isLoading && (
        <form onSubmit={handleSubmit} style={{ padding: '16px 20px 88px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: C.card, borderRadius: 12, padding: '16px', border: `1px solid ${C.bor}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.mut, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: FFb }}>Select User & Week</div>
            <select style={SEL} value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="">— Select a user —</option>
              {users.map((u) => <option key={u.user_id} value={u.user_id}>{u.team_name}</option>)}
            </select>
            <select style={SEL} value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)}>
              <option value="">— Select a week —</option>
              {Array.from({ length: 18 }, (_, i) => i + 1).map((w) => <option key={w} value={w}>Week {w}</option>)}
            </select>
          </div>

          <div style={{ background: C.card, borderRadius: 12, padding: '16px', border: `1px solid ${C.bor}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.mut, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: FFb }}>Picks</div>
            {picks.map((pick, index) => (
              <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select style={{ ...SEL, flex: 1 }} value={pick.teamId} onChange={(e) => handlePickChange(index, 'teamId', e.target.value)} disabled={!selectedWeek}>
                  <option value="">— Team —</option>
                  {games.map((game) => (
                    <React.Fragment key={game.id}>
                      <option value={game.home_team_id}>{game.home_team_name} (H)</option>
                      <option value={game.away_team_id}>{game.away_team_name} (A)</option>
                    </React.Fragment>
                  ))}
                </select>
                <select style={{ ...SEL, width: 90 }} value={pick.points} onChange={(e) => handlePickChange(index, 'points', e.target.value)} disabled={!pick.teamId}>
                  <option value="">Pts</option>
                  {Array.from({ length: leagueInfo.weekly_points }, (_, i) => i + 1).map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setPicks(picks.filter((_, i) => i !== index))}
                  style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 8, background: C.d2, border: `1px solid ${C.bor}`, color: C.red, fontFamily: FF, fontSize: 18, fontWeight: 900, cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setPicks([...picks, { teamId: '', points: '' }])}
              style={{ padding: '11px', borderRadius: 10, background: C.d2, border: `1px solid ${C.bor}`, color: C.mut, fontFamily: FF, fontSize: 15, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              + Add Pick
            </button>
          </div>

          {msg && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: C.d2, border: `1px solid ${C.bor}`, color: msg.includes('successfully') ? C.grn : C.red, fontFamily: FFb, fontSize: 14 }}>
              {msg}
            </div>
          )}

          <button type="submit" style={{ padding: '16px', borderRadius: 12, background: C.amb, border: 'none', color: '#000', fontFamily: FF, fontSize: 18, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}>
            Submit Picks
          </button>
        </form>
      )}

      <LeagueTabBar leagueId={leagueId} />
    </div>
  );
};

export default Commissioner;
