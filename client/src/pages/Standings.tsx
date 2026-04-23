import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.tsx';
import LeagueTabBar from '../components/LeagueTabBar.tsx';
import apiUrl from '../services/serverConfig.ts';

type SortKey = 'total_points' | 'picks_correct' | 'max_streak' | 'curr_streak' | 'perfect_weeks' | 'overdog_correct' | 'underdog_correct';

const C = {
  bg: '#0c1628', card: '#152540', d2: '#1a2d4a',
  amb: '#f59e0b', txt: '#e2e8f0', mut: '#475569', bor: '#1e3354',
} as const;
const FF = "'Barlow Condensed', sans-serif";
const FFb = "'Barlow', sans-serif";

const SORT_OPTS: { key: SortKey; label: string }[] = [
  { key: 'total_points', label: 'Points' },
  { key: 'picks_correct', label: 'Correct' },
  { key: 'curr_streak', label: 'Streak' },
  { key: 'max_streak', label: 'Best' },
  { key: 'perfect_weeks', label: 'Perfect' },
  { key: 'overdog_correct', label: 'Favs' },
  { key: 'underdog_correct', label: 'Dogs' },
];

const Standings = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useContext(AuthContext);
  const [standings, setStandings] = useState<any[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('total_points');

  useEffect(() => {
    axios.get(`${apiUrl}/getleaguestandings/${leagueId}`)
      .then((res) => {
        setStandings(res.data.map((s: any) => ({
          ...s,
          picks_correct: Number(s.overdog_correct) + Number(s.underdog_correct),
        })));
      })
      .catch((err) => console.error('Error fetching standings:', err));
  }, [leagueId]);

  const sorted = [...standings].sort((a, b) => Number(b[sortKey]) - Number(a[sortKey]));

  const fmt = (v: any) => {
    const n = Number(v);
    return Number.isInteger(n) ? n : n.toFixed(1);
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: FF }}>
      <div style={{
        background: 'linear-gradient(160deg, #1a3a7a 0%, #0e1e3d 100%)',
        padding: '20px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 99, background: 'rgba(129,140,248,0.08)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: C.amb, letterSpacing: 3, textTransform: 'uppercase', fontFamily: FFb, marginBottom: 2, position: 'relative', zIndex: 1 }}>League</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: -0.5, position: 'relative', zIndex: 1 }}>Standings</div>
      </div>

      <div style={{ padding: '12px 16px', background: C.card, borderBottom: `1px solid ${C.bor}`, display: 'flex', gap: 6, overflowX: 'auto' }}>
        {SORT_OPTS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortKey(opt.key)}
            style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 20,
              background: sortKey === opt.key ? C.amb : C.d2,
              border: `1px solid ${sortKey === opt.key ? 'transparent' : C.bor}`,
              color: sortKey === opt.key ? '#000' : C.mut,
              fontFamily: FF, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 16px 88px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((s, i) => {
          const isMe = s.user_id === user?.userId;
          return (
            <div
              key={s.user_id}
              style={{
                background: isMe ? C.d2 : C.card,
                border: `1px solid ${isMe ? C.amb : C.bor}`,
                borderRadius: 12, padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 99,
                    background: i === 0 ? C.amb : C.d2,
                    border: `1px solid ${i === 0 ? 'transparent' : C.bor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: FF, fontSize: 13, fontWeight: 900,
                    color: i === 0 ? '#000' : C.mut,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontFamily: FF, fontSize: 18, fontWeight: 900, color: C.txt, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    {s.team_name}
                  </span>
                </div>
                <span style={{ fontFamily: FF, fontSize: 22, fontWeight: 900, color: C.amb }}>
                  {fmt(s.total_points)}
                </span>
              </div>
              <div style={{ display: 'flex', borderTop: `1px solid ${C.bor}`, paddingTop: 10 }}>
                {[
                  { label: 'Correct', val: s.picks_correct },
                  { label: 'Streak', val: s.curr_streak },
                  { label: 'Best', val: s.max_streak },
                  { label: 'Perfect', val: s.perfect_weeks },
                ].map((stat) => (
                  <div key={stat.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontFamily: FF, fontSize: 16, fontWeight: 900, color: C.txt }}>{stat.val}</span>
                    <span style={{ fontFamily: FFb, fontSize: 10, color: C.mut, textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <LeagueTabBar leagueId={leagueId} />
    </div>
  );
};

export default Standings;
