import { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.tsx';
import LeagueTabBar from '../components/LeagueTabBar.tsx';
import apiUrl from '../services/serverConfig.ts';

const C = {
  bg: '#0c1628', card: '#152540', d2: '#1a2d4a',
  amb: '#f59e0b', txt: '#e2e8f0', mut: '#475569', bor: '#1e3354',
  grn: '#10b981', red: '#ef4444',
} as const;
const FF = "'Barlow Condensed', sans-serif";
const FFb = "'Barlow', sans-serif";

const pickStyle = (status: string): React.CSSProperties => {
  if (status === 'winner') return { background: 'rgba(16,185,129,0.15)', color: C.grn, border: '1px solid rgba(16,185,129,0.3)' };
  if (status === 'loser') return { background: 'rgba(239,68,68,0.12)', color: C.red, border: '1px solid rgba(239,68,68,0.25)' };
  if (status === 'push') return { background: 'rgba(245,158,11,0.12)', color: C.amb, border: '1px solid rgba(245,158,11,0.25)' };
  if (status === 'game-started') return { background: C.d2, color: C.txt, border: `1px solid ${C.bor}` };
  return { color: C.bor };
};

const Pickgrid = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState<any[]>([]);
  const [userSelections, setUserSelections] = useState<Record<number, Record<number, any[]>>>({});
  const [games, setGames] = useState<Record<number, Record<number, any>>>({});
  const [leagueInfo, setLeagueInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [leagueRes, usersRes] = await Promise.all([
          axios.get(`${apiUrl}/leagueinfo/${leagueId}`),
          axios.get(`${apiUrl}/getusersinleague/${leagueId}`),
        ]);
        const league = leagueRes.data.league[0];
        setLeagueInfo(league);
        setUsers(usersRes.data);

        const [gamesRes, selectionsRes] = await Promise.all([
          axios.get(`${apiUrl}/games/season/${league.year}`),
          axios.get(`${apiUrl}/userselections/${leagueId}`),
        ]);

        const allGames: Record<number, Record<number, any>> = {};
        for (const g of gamesRes.data) {
          if (!allGames[g.week]) allGames[g.week] = {};
          allGames[g.week][g.id] = g;
        }
        setGames(allGames);

        const organized: Record<number, Record<number, any[]>> = {};
        for (const s of selectionsRes.data) {
          if (!organized[s.user_id]) organized[s.user_id] = {};
          if (!organized[s.user_id][s.week]) organized[s.user_id][s.week] = [];
          organized[s.user_id][s.week].push(s);
        }
        setUserSelections(organized);
      } catch (err) {
        console.error('Error fetching pickgrid data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [leagueId]);

  const getPicksForWeek = (userId: number, week: number) => {
    const selections = userSelections[userId]?.[week] || [];
    const weekGames = games[week];
    if (!weekGames) return [];

    return selections
      .filter((s) => weekGames[s.game_id])
      .map((pick) => {
        const game = weekGames[pick.game_id];
        if (!game || game.game_started === 0) return { status: 'pending', content: '—' };

        let status = 'game-started';
        if (game.game_completed === 1) {
          const isHome = game.home_team_id === pick.team_id;
          const isAway = game.away_team_id === pick.team_id;
          if (game.spread_winner === 'home') status = isHome ? 'winner' : 'loser';
          else if (game.spread_winner === 'away') status = isAway ? 'winner' : 'loser';
          else if (game.spread_winner === 'push') status = 'push';
        }

        const abbr = game.home_team_id === pick.team_id
          ? (game.home_team_abbr || game.home_team_name)
          : (game.away_team_abbr || game.away_team_name);
        return { status, content: `${abbr} ${pick.points}` };
      });
  };

  const scrollGrid = (dir: number) => {
    gridRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: FF }}>
      <div style={{
        background: 'linear-gradient(160deg, #1a3a7a 0%, #0e1e3d 100%)',
        padding: '20px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 99, background: 'rgba(129,140,248,0.08)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: C.amb, letterSpacing: 3, textTransform: 'uppercase', fontFamily: FFb, marginBottom: 2, position: 'relative', zIndex: 1 }}>
          {leagueInfo?.year} Season
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: -0.5, position: 'relative', zIndex: 1 }}>Pick Grid</div>
      </div>

      {/* Scroll controls — useful on desktop where there's no swipe */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '6px 14px', background: C.card, borderBottom: `1px solid ${C.bor}`, gap: 6 }}>
        <span style={{ fontFamily: FFb, fontSize: 11, color: C.mut, marginRight: 'auto', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Scroll
        </span>
        <button
          onClick={() => scrollGrid(-1)}
          style={{ background: C.d2, border: `1px solid ${C.bor}`, color: C.txt, fontFamily: FF, fontSize: 15, fontWeight: 700, padding: '4px 14px', borderRadius: 6, cursor: 'pointer', lineHeight: 1.2 }}
        >
          ←
        </button>
        <button
          onClick={() => scrollGrid(1)}
          style={{ background: C.d2, border: `1px solid ${C.bor}`, color: C.txt, fontFamily: FF, fontSize: 15, fontWeight: 700, padding: '4px 14px', borderRadius: 6, cursor: 'pointer', lineHeight: 1.2 }}
        >
          →
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: 32, color: C.mut, fontFamily: FFb, fontSize: 14 }}>Loading…</div>
      ) : (
        /* Both axes scroll so sticky top on thead + sticky left on first column both work */
        <div ref={gridRef} style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 185px)' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: '100%' }}>
            <thead>
              <tr style={{ background: C.card }}>
                <th style={{
                  position: 'sticky', left: 0, top: 0, background: C.card, zIndex: 15,
                  padding: '10px 14px', fontFamily: FF, fontSize: 12, color: C.mut,
                  textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700,
                  textAlign: 'left', borderBottom: `1px solid ${C.bor}`,
                  borderRight: `1px solid ${C.bor}`, minWidth: 110,
                }}>Team</th>
                {Array.from({ length: 18 }, (_, i) => (
                  <th key={i + 1} style={{
                    position: 'sticky', top: 0, background: C.card, zIndex: 10,
                    padding: '10px 8px', fontFamily: FF, fontSize: 12, color: C.mut,
                    textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700,
                    borderBottom: `1px solid ${C.bor}`, minWidth: 90,
                  }}>
                    Wk {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = u.user_id === user?.userId;
                return (
                  <tr key={u.user_id} style={{ borderBottom: `1px solid ${C.bor}` }}>
                    <td style={{
                      position: 'sticky', left: 0, zIndex: 5,
                      background: isMe ? C.d2 : C.bg,
                      padding: '8px 14px', fontFamily: FF, fontSize: 13,
                      color: isMe ? C.amb : C.txt, fontWeight: 900,
                      textTransform: 'uppercase', letterSpacing: 0.3,
                      borderRight: `1px solid ${C.bor}`,
                    }}>
                      {u.team_name}
                    </td>
                    {Array.from({ length: 18 }, (_, i) => {
                      const wkPicks = getPicksForWeek(u.user_id, i + 1);
                      return (
                        <td key={i + 1} style={{ padding: '5px', verticalAlign: 'top', minWidth: 90, background: isMe ? 'rgba(26,45,74,0.3)' : 'transparent' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {wkPicks.length > 0 ? wkPicks.map((pick, idx) => (
                              <div key={idx} style={{ padding: '3px 6px', borderRadius: 5, fontFamily: FF, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, ...pickStyle(pick.status) }}>
                                {pick.content}
                              </div>
                            )) : (
                              <div style={{ padding: '3px 6px', color: C.bor, fontFamily: FF, fontSize: 12 }}>—</div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <LeagueTabBar leagueId={leagueId} />
    </div>
  );
};

export default Pickgrid;
