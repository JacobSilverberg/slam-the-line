import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.tsx';
import apiUrl from '../services/serverConfig.ts';

const CURRENT_NFL_YEAR = parseInt(import.meta.env.VITE_NFL_YEAR || '2025', 10);

const C = {
  bg: '#0c1628', card: '#152540', d2: '#1a2d4a',
  amb: '#f59e0b', txt: '#e2e8f0', mut: '#475569', bor: '#1e3354',
} as const;
const FF = "'Barlow Condensed', sans-serif";
const FFb = "'Barlow', sans-serif";

const INP: React.CSSProperties = {
  width: '100%', padding: '15px',
  background: C.d2, border: `1px solid ${C.bor}`,
  borderRadius: 10, color: C.txt, fontSize: 16,
  fontFamily: FFb, outline: 'none', boxSizing: 'border-box',
};

const LBL: React.CSSProperties = {
  fontFamily: FFb, fontSize: 12, fontWeight: 700,
  color: C.mut, textTransform: 'uppercase', letterSpacing: 1,
  marginBottom: 6, display: 'block',
};

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
    if (max < min) { setError('Max picks must be ≥ min picks.'); return; }
    try {
      const res = await axios.post(`${apiUrl}/createleague`, {
        gamesSelectMax: max, gamesSelectMin: min, name,
        sport: 'nfl', type: 'league', weeklyPoints, year: CURRENT_NFL_YEAR,
      });
      const leagueId = res.data.id;
      await axios.post(`${apiUrl}/leagueregistration/${leagueId}/users/${user!.userId}`, {
        league_role: 'commish', team_name: teamName,
      });
      navigate(`/league/${leagueId}/picksheet`);
    } catch (err: any) {
      setError(err.response?.data?.msg || err.message || 'Error creating league.');
    }
  };

  const allFilled = name && teamName && gamesSelectMax && gamesSelectMin && weeklyPoints;

  return (
    <div style={{ background: C.bg, minHeight: 'calc(100vh - 56px)', fontFamily: FF }}>
      <div style={{
        background: 'linear-gradient(160deg, #1a3a7a 0%, #0e1e3d 100%)',
        padding: '24px 20px 20px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 99, background: 'rgba(129,140,248,0.08)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: C.amb, letterSpacing: 3, textTransform: 'uppercase', fontFamily: FFb, marginBottom: 2, position: 'relative', zIndex: 1 }}>NFL {CURRENT_NFL_YEAR}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: -0.5, position: 'relative', zIndex: 1 }}>Create League</div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: C.card, borderRadius: 12, padding: '16px 18px', border: `1px solid ${C.bor}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={LBL}>League Name</label>
            <input style={INP} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. The Betting League" required />
          </div>
          <div>
            <label style={LBL}>Your Team Name</label>
            <input style={INP} type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. Sharp Money" required />
          </div>
        </div>

        <div style={{ background: C.card, borderRadius: 12, padding: '16px 18px', border: `1px solid ${C.bor}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={LBL}>Min Picks/Week</label>
              <input style={INP} type="number" min={1} value={gamesSelectMin} onChange={(e) => setGamesSelectMin(e.target.value)} placeholder="3" required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={LBL}>Max Picks/Week</label>
              <input style={INP} type="number" min={1} value={gamesSelectMax} onChange={(e) => setGamesSelectMax(e.target.value)} placeholder="5" required />
            </div>
          </div>
          <div>
            <label style={LBL}>Weekly Points Pool</label>
            <input style={INP} type="number" min={1} value={weeklyPoints} onChange={(e) => setWeeklyPoints(e.target.value)} placeholder="10" required />
          </div>
        </div>

        {error && <p style={{ color: '#ef4444', fontFamily: FFb, fontSize: 14, margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={!allFilled}
          style={{
            padding: '16px', borderRadius: 12,
            background: allFilled ? C.amb : C.d2,
            border: `1px solid ${allFilled ? 'transparent' : C.bor}`,
            color: allFilled ? '#000' : C.mut,
            fontFamily: FF, fontSize: 20, fontWeight: 900, letterSpacing: 1.5,
            textTransform: 'uppercase', cursor: allFilled ? 'pointer' : 'default',
          }}
        >
          Create League
        </button>
      </form>
    </div>
  );
};

export default CreateLeague;
