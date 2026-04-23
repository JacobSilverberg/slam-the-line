import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.tsx';
import fetchUserLeagues from '../services/fetchUserLeagues.ts';
import apiUrl from '../services/serverConfig.ts';
import logo from '../assets/STL_Logo.webp';

const CURRENT_NFL_YEAR = parseInt(import.meta.env.VITE_NFL_YEAR || '2025', 10);
const DEFAULT_LEAGUE_ID = import.meta.env.VITE_DEFAULT_LEAGUE_ID || null;

const C = {
  bg: '#0c1628', card: '#152540', d2: '#1a2d4a',
  amb: '#f59e0b', ind: '#818cf8', txt: '#e2e8f0',
  mut: '#94a3b8', bor: '#1e3354',
} as const;
const FF = "'Barlow Condensed', sans-serif";
const FFb = "'Barlow', sans-serif";

const INP: React.CSSProperties = {
  width: '100%', padding: '14px 16px',
  background: C.d2, border: `1px solid ${C.bor}`,
  borderRadius: 10, color: C.txt, fontSize: 16,
  fontFamily: FFb, outline: 'none', boxSizing: 'border-box',
};

const Home = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [teamName, setTeamName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    fetchUserLeagues(user.userId).then((data) => {
      setLeagues(data.filter((l: any) => l.year === CURRENT_NFL_YEAR));
    });
  }, [isAuthenticated, user]);

  const handleJoinDefault = () => {
    if (!teamName.trim() || !DEFAULT_LEAGUE_ID || !user) return;
    axios
      .post(`${apiUrl}/leagueregistration/${DEFAULT_LEAGUE_ID}/users/${user.userId}`, {
        league_role: 'owner', team_name: teamName,
      })
      .then(() => navigate(`/league/${DEFAULT_LEAGUE_ID}/picksheet`))
      .catch((err) => alert(err.response?.data?.msg || 'Error registering for the league.'));
  };

  if (isAuthenticated) {
    return (
      <div style={{ background: C.bg, minHeight: 'calc(100vh - 56px)', fontFamily: FF }}>
        <div style={{
          background: 'linear-gradient(160deg, #1a3a7a 0%, #0e1e3d 100%)',
          padding: '24px 20px 20px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 99, background: 'rgba(129,140,248,0.08)', pointerEvents: 'none' }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: C.amb, letterSpacing: 3, textTransform: 'uppercase', fontFamily: FFb, marginBottom: 4, position: 'relative', zIndex: 1 }}>NFL Picks League</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: -0.5, position: 'relative', zIndex: 1 }}>Welcome Back</div>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.mut, letterSpacing: 2, textTransform: 'uppercase', fontFamily: FFb, marginBottom: 10 }}>Your Leagues</div>
            {leagues.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {leagues.map((league) => (
                  <Link
                    key={league.league_id}
                    to={`/league/${league.league_id}/picksheet`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: C.card, borderRadius: 12, padding: '16px 18px',
                      border: `1px solid ${C.bor}`, textDecoration: 'none',
                    }}
                  >
                    <span style={{ fontSize: 18, fontWeight: 900, color: C.txt, textTransform: 'uppercase', letterSpacing: 0.5 }}>{league.league_name}</span>
                    <span style={{ fontSize: 20, color: C.amb }}>›</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ background: C.card, borderRadius: 12, padding: '20px 18px', border: `1px solid ${C.bor}` }}>
                <div style={{ fontSize: 15, color: C.mut, fontFamily: FFb }}>You're not in any leagues yet.</div>
              </div>
            )}
          </div>

          {DEFAULT_LEAGUE_ID && (
            <div style={{ background: C.card, borderRadius: 12, padding: '20px 18px', border: `1px solid ${C.bor}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.txt, textTransform: 'uppercase', letterSpacing: 0.5 }}>Joining Year 7?</div>
              <div style={{ fontSize: 14, color: C.mut, fontFamily: FFb }}>Enter your team name to register.</div>
              <input style={INP} type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Your team name" />
              <button
                onClick={handleJoinDefault}
                disabled={!teamName.trim()}
                style={{
                  padding: '14px', borderRadius: 10,
                  background: teamName.trim() ? C.amb : C.d2,
                  border: `1px solid ${teamName.trim() ? 'transparent' : C.bor}`,
                  color: teamName.trim() ? '#000' : C.mut,
                  fontFamily: FF, fontSize: 17, fontWeight: 900, letterSpacing: 1,
                  textTransform: 'uppercase', cursor: teamName.trim() ? 'pointer' : 'default',
                }}
              >
                Join the Betting League
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/createleague" style={{
              flex: 1, display: 'block', padding: '14px', borderRadius: 10, textAlign: 'center',
              background: C.amb, color: '#000', fontFamily: FF, fontSize: 16, fontWeight: 900,
              letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none',
            }}>
              Create League
            </Link>
            <Link to="/joinleague" style={{
              flex: 1, display: 'block', padding: '14px', borderRadius: 10, textAlign: 'center',
              background: C.d2, border: `1px solid ${C.bor}`, color: C.txt,
              fontFamily: FF, fontSize: 16, fontWeight: 900, letterSpacing: 1,
              textTransform: 'uppercase', textDecoration: 'none',
            }}>
              Join League
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.bg, fontFamily: FF }}>
      <div style={{
        background: 'linear-gradient(160deg, #1a3a7a 0%, #0e1e3d 100%)',
        padding: '48px 28px 40px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 40, right: -40, width: 160, height: 160, borderRadius: 99, background: 'rgba(129,140,248,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -30, width: 140, height: 140, borderRadius: 99, background: 'rgba(245,158,11,0.07)', pointerEvents: 'none' }} />
        <img src={logo} alt="Slam the Line" style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 14, position: 'relative', zIndex: 1 }} />
        <div style={{ fontSize: 40, fontWeight: 900, color: '#fff', letterSpacing: -0.5, textTransform: 'uppercase', lineHeight: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>Slam the Line</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.amb, letterSpacing: 3, textTransform: 'uppercase', marginTop: 8, position: 'relative', zIndex: 1, fontFamily: FFb }}>NFL Picks League</div>
      </div>

      <div style={{ flex: 1, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: C.txt, textTransform: 'uppercase', letterSpacing: -0.5 }}>Get Ready to Slam the Line!</div>
        <div style={{ fontSize: 16, color: C.mut, fontFamily: FFb, lineHeight: 1.6 }}>
          The ultimate season-long ATS picks league. Challenge your friends, track your progress, and see who reigns supreme.
        </div>
        <div style={{ fontSize: 15, color: C.mut, fontFamily: FFb, lineHeight: 1.6 }}>
          No more juggling apps and spreadsheets. Everything you need in one seamless experience.
        </div>
        <Link to="/login" style={{
          display: 'block', padding: '16px', borderRadius: 12, textAlign: 'center',
          background: C.amb, color: '#000', fontFamily: FF, fontSize: 20,
          fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', textDecoration: 'none', marginTop: 8,
        }}>
          Sign In
        </Link>
        <Link to="/register" style={{
          display: 'block', padding: '16px', borderRadius: 12, textAlign: 'center',
          background: C.d2, border: `1px solid ${C.bor}`, color: C.txt,
          fontFamily: FF, fontSize: 20, fontWeight: 900, letterSpacing: 1.5,
          textTransform: 'uppercase', textDecoration: 'none',
        }}>
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default Home;
