import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.tsx';
import apiUrl from '../services/serverConfig.ts';

const C = {
  bg: '#0c1628', card: '#152540', d2: '#1a2d4a',
  amb: '#f59e0b', ind: '#818cf8', txt: '#e2e8f0',
  mut: '#475569', bor: '#1e3354',
} as const;
const FF = "'Barlow Condensed', sans-serif";
const FFb = "'Barlow', sans-serif";

const INP: React.CSSProperties = {
  width: '100%', padding: '15px',
  background: C.card, border: `1px solid ${C.bor}`,
  borderRadius: 12, color: C.txt, fontSize: 16,
  fontFamily: FFb, outline: 'none', boxSizing: 'border-box',
};

const JoinLeague = () => {
  const { user } = useContext(AuthContext);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm) { setLeagues([]); return; }
    axios.get(`${apiUrl}/searchleagues?query=${searchTerm}`)
      .then((res) => setLeagues(res.data))
      .catch(() => setLeagues([]));
  }, [searchTerm]);

  const handleRegistration = () => {
    if (!selectedLeagueId || !teamName || !user) { setError('Please enter a team name.'); return; }
    setError('');
    axios.post(`${apiUrl}/leagueregistration/${selectedLeagueId}/users/${user.userId}`, {
      league_role: 'owner', team_name: teamName,
    })
      .then(() => navigate(`/league/${selectedLeagueId}/picksheet`))
      .catch((err) => setError(err.response?.data?.msg || 'Error registering for the league.'));
  };

  const selectedLeague = leagues.find((l) => l.id === selectedLeagueId);

  return (
    <div style={{ background: C.bg, minHeight: 'calc(100vh - 56px)', fontFamily: FF }}>
      <div style={{
        background: 'linear-gradient(160deg, #1a3a7a 0%, #0e1e3d 100%)',
        padding: '24px 20px 20px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 99, background: 'rgba(129,140,248,0.08)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: C.amb, letterSpacing: 3, textTransform: 'uppercase', fontFamily: FFb, marginBottom: 2, position: 'relative', zIndex: 1 }}>Find Your League</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: -0.5, position: 'relative', zIndex: 1 }}>Join a League</div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {selectedLeagueId ? (
          <>
            <div style={{ background: C.card, borderRadius: 12, padding: '16px 18px', border: `1px solid ${C.amb}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.mut, letterSpacing: 2, textTransform: 'uppercase', fontFamily: FFb, marginBottom: 4 }}>Selected League</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.txt, textTransform: 'uppercase' }}>{selectedLeague?.name}</div>
            </div>
            <input style={INP} type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Your team name" />
            {error && <p style={{ color: '#ef4444', fontFamily: FFb, fontSize: 14, margin: 0 }}>{error}</p>}
            <button
              onClick={handleRegistration}
              disabled={!teamName.trim()}
              style={{
                padding: '16px', borderRadius: 12,
                background: teamName.trim() ? C.amb : C.d2,
                border: `1px solid ${teamName.trim() ? 'transparent' : C.bor}`,
                color: teamName.trim() ? '#000' : C.mut,
                fontFamily: FF, fontSize: 20, fontWeight: 900, letterSpacing: 1.5,
                textTransform: 'uppercase', cursor: teamName.trim() ? 'pointer' : 'default',
              }}
            >
              Register
            </button>
            <button
              onClick={() => setSelectedLeagueId(null)}
              style={{ padding: '12px', borderRadius: 10, background: 'none', border: `1px solid ${C.bor}`, color: C.mut, fontFamily: FF, fontSize: 15, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}
            >
              Back to Search
            </button>
          </>
        ) : (
          <>
            <input style={INP} type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search league name…" />
            {leagues.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {leagues.map((league) => (
                  <button
                    key={league.id}
                    onClick={() => setSelectedLeagueId(league.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: C.card, borderRadius: 12, padding: '16px 18px',
                      border: `1px solid ${C.bor}`, cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontFamily: FF, fontSize: 18, fontWeight: 900, color: C.txt, textTransform: 'uppercase' }}>{league.name}</span>
                    <span style={{ fontSize: 20, color: C.amb }}>›</span>
                  </button>
                ))}
              </div>
            ) : searchTerm ? (
              <div style={{ color: C.mut, fontFamily: FFb, fontSize: 14 }}>No leagues found.</div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default JoinLeague;
