import { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.tsx';
import fetchUserLeagues from '../services/fetchUserLeagues.ts';

const CURRENT_NFL_YEAR = parseInt(import.meta.env.VITE_NFL_YEAR || '2025', 10);

const C = {
  d2: '#1a2d4a', amb: '#f59e0b', ind: '#818cf8',
  txt: '#e2e8f0', mut: '#94a3b8', bor: '#1e3354',
} as const;
const FF = "'Barlow Condensed', sans-serif";
const FFb = "'Barlow', sans-serif";

const LeagueDropdown = ({ renderType = 'dropdown' }: { renderType?: 'dropdown' | 'list' }) => {
  const { user } = useContext(AuthContext);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchUserLeagues(user.userId).then((data) => {
      setLeagues(data.filter((l: any) => l.year === CURRENT_NFL_YEAR));
    });
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (renderType === 'list') {
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {leagues.length > 0 ? (
          leagues.map((l) => (
            <li key={l.league_id}>
              <Link
                to={`/league/${l.league_id}/picksheet`}
                style={{ color: C.ind, fontFamily: FFb, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}
              >
                {l.league_name}
              </Link>
            </li>
          ))
        ) : (
          <li style={{ color: C.mut, fontFamily: FFb, fontSize: 14 }}>No leagues yet.</li>
        )}
      </ul>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'none', border: '1px solid #1e3354',
          color: open ? C.amb : C.mut,
          fontFamily: FF, fontSize: 13, fontWeight: 700, letterSpacing: 1,
          padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
          textTransform: 'uppercase',
        }}
      >
        Leagues
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: C.d2, border: `1px solid ${C.bor}`, borderRadius: 10,
          minWidth: 180, zIndex: 300, overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {leagues.length > 0 ? (
            leagues.map((l) => (
              <Link
                key={l.league_id}
                to={`/league/${l.league_id}/picksheet`}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block', padding: '12px 16px',
                  color: C.txt, fontFamily: FFb, fontSize: 14, fontWeight: 600,
                  textDecoration: 'none', borderBottom: `1px solid ${C.bor}`,
                }}
              >
                {l.league_name}
              </Link>
            ))
          ) : (
            <div style={{ padding: '12px 16px', color: C.mut, fontFamily: FFb, fontSize: 14 }}>
              No leagues
            </div>
          )}
          <Link
            to="/joinleague"
            onClick={() => setOpen(false)}
            style={{
              display: 'block', padding: '12px 16px',
              color: C.amb, fontFamily: FFb, fontSize: 13, fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            + Join a League
          </Link>
        </div>
      )}
    </div>
  );
};

export default LeagueDropdown;
