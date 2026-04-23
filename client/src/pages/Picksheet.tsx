import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.tsx';
import { WeekContext } from '../context/WeekContext.tsx';
import LeagueTabBar from '../components/LeagueTabBar.tsx';
import apiUrl from '../services/serverConfig.ts';

const C = {
  bg: '#0c1628', card: '#152540', d2: '#1a2d4a',
  amb: '#f59e0b', ind: '#818cf8', txt: '#e2e8f0',
  mut: '#475569', bor: '#1e3354', grn: '#10b981', red: '#ef4444',
} as const;

const FF = "'Barlow Condensed', sans-serif";

const Picksheet = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { week } = useContext(WeekContext) as { week: number };
  const { user } = useContext(AuthContext);
  const userId = user?.userId;

  const [games, setGames] = useState<any[]>([]);
  const [leagueInfo, setLeagueInfo] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Record<number, number>>({});
  const [weeklyPoints, setWeeklyPoints] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingSelections, setHasExistingSelections] = useState(false);

  const totalPts: number = leagueInfo.weekly_points || 40;
  const minPicks: number = leagueInfo.games_select_min || 3;
  const maxPicks: number = leagueInfo.games_select_max || 5;
  const totalUsed = Object.values(weeklyPoints).reduce((a, b) => a + b, 0);
  const pickCount = Object.keys(selectedTeam).length;
  const ptsLeft = totalPts - totalUsed;
  const isReady = totalUsed === totalPts && pickCount >= minPicks;

  useEffect(() => {
    const fetch = async () => {
      try {
        const [leagueRes, gamesRes] = await Promise.all([
          axios.get(`${apiUrl}/leagueinfo/${leagueId}`),
          axios.get(`${apiUrl}/games/${week}`),
        ]);
        const league = leagueRes.data.league[0];
        setLeagueInfo(league);
        setGames(
          gamesRes.data
            .filter((g: any) => g.nfl_year === league.year)
            .sort((a: any, b: any) => new Date(a.game_start_time).getTime() - new Date(b.game_start_time).getTime())
        );
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [leagueId, week]);

  useEffect(() => {
    if (!week || week <= 0 || !userId) return;
    const fetchSelections = async () => {
      try {
        const res = await axios.get(`${apiUrl}/userselections/${leagueId}/${userId}/${week}`);
        const saved = res.data.league.filter((s: any) => s.week === week);
        if (saved.length > 0) {
          setHasExistingSelections(true);
          const st: Record<number, number> = {};
          const wp: Record<number, number> = {};
          saved.forEach((s: any) => { st[s.game_id] = s.team_id; wp[s.game_id] = s.points; });
          setSelectedTeam(st);
          setWeeklyPoints(wp);
        }
      } catch {
        setSelectedTeam({});
        setWeeklyPoints({});
      }
    };
    fetchSelections();
  }, [leagueId, userId, week]);

  const handleSelectTeam = (gameId: number, teamId: number) => {
    const game = games.find((g) => g.id === gameId);
    if (game?.game_started) return;
    setSelectedTeam((prev) => {
      if (prev[gameId] === teamId) {
        const next = { ...prev };
        delete next[gameId];
        setWeeklyPoints((p) => { const n = { ...p }; delete n[gameId]; return n; });
        return next;
      }
      if (Object.keys(prev).length >= maxPicks) return prev;
      if (!weeklyPoints[gameId]) {
        setWeeklyPoints((p) => ({ ...p, [gameId]: 5 }));
      }
      return { ...prev, [gameId]: teamId };
    });
  };

  const adj = (gameId: number, d: number) => {
    const game = games.find((g) => g.id === gameId);
    if (game?.game_started) return;
    setWeeklyPoints((p) => ({ ...p, [gameId]: Math.max(1, (p[gameId] || 5) + d) }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (totalUsed !== totalPts) { alert(`Distribute exactly ${totalPts} points.`); return; }
    if (pickCount < minPicks) { alert(`Select at least ${minPicks} games.`); return; }
    setIsSubmitting(true);
    const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const picks = games
      .filter((g) => weeklyPoints[g.id] !== undefined)
      .map((g) => ({ gameId: g.id, teamId: selectedTeam[g.id], points: weeklyPoints[g.id], createdAt: ts, updatedAt: ts, week }));
    try {
      if (hasExistingSelections) {
        await axios.delete(`${apiUrl}/removeuserselections/${leagueId}/${userId}/${week}`);
      }
      await axios.post(`${apiUrl}/submitpicks/`, { picks, userId, leagueId });
      setHasExistingSelections(true);
      alert(hasExistingSelections ? 'Picks updated!' : 'Picks submitted!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit picks.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fmt = (spread: number) => {
    const n = parseFloat(String(spread));
    return n > 0 ? `+${n.toFixed(1)}` : n.toFixed(1);
  };

  const fmtDate = (dt: string) =>
    new Date(dt).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }).toUpperCase();

  const fmtTime = (dt: string) =>
    new Date(dt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (isLoading) return (
    <div style={{ height: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF, fontSize: 20, color: C.mut }}>
      Loading…
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FF, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, #1a3a7a 0%, #0c1628 100%)',
        padding: '14px 16px 12px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: 99, background: 'rgba(99,102,241,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -20, width: 80, height: 80, borderRadius: 99, background: 'rgba(245,158,11,0.08)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 2 }}>
          {leagueInfo.name}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: -0.5, lineHeight: 1, textTransform: 'uppercase' }}>
          Week {week} Picks
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(255,255,255,0.07)', borderRadius: 99, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: 6, height: 6, borderRadius: 99, background: totalUsed === totalPts ? C.grn : totalUsed > totalPts ? C.red : C.amb }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{totalUsed} / {totalPts} pts</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(255,255,255,0.07)', borderRadius: 99, border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: pickCount >= minPicks ? C.grn : C.amb }}>{pickCount} picks · need {minPicks}–{maxPicks}</span>
          </div>
          {hasExistingSelections && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: `${C.grn}22`, borderRadius: 99, border: `1px solid ${C.grn}44` }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.grn }}>✓ Submitted</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: C.bor }}>
        <div style={{ height: '100%', width: `${Math.min(100, (totalUsed / totalPts) * 100)}%`, background: totalUsed > totalPts ? C.red : C.ind, transition: 'width 0.2s' }} />
      </div>

      {/* Games list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {games.length === 0 && (
          <p style={{ color: C.mut, fontSize: 16, textAlign: 'center', marginTop: 32 }}>No games available for this week.</p>
        )}
        {games.map((game) => {
          const isSel = selectedTeam[game.id];
          const locked = Boolean(game.game_started);
          const p = weeklyPoints[game.id] || 5;

          const teams = [
            { id: game.away_team_id, abbr: game.away_team_abbr, name: game.away_team_name, spread: game.away_curr_spread },
            { id: game.home_team_id, abbr: game.home_team_abbr, name: game.home_team_name, spread: game.home_curr_spread },
          ];

          return (
            <div key={game.id} style={{
              background: C.card,
              border: isSel ? `1px solid ${C.amb}66` : `1px solid ${C.bor}`,
              borderLeft: isSel ? `3px solid ${C.amb}` : undefined,
              borderRadius: 12, overflow: 'hidden',
              opacity: locked ? 0.55 : 1,
            }}>
              {/* Date / time row */}
              <div style={{ padding: '4px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.d2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: C.mut }}>{fmtDate(game.game_start_time)}</span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: locked ? C.red : C.mut }}>{locked ? 'LOCKED' : fmtTime(game.game_start_time)}</span>
              </div>

              {/* Team buttons */}
              <div style={{ padding: '6px 8px', display: 'flex', gap: 6 }}>
                {teams.map((team) => {
                  const on = selectedTeam[game.id] === team.id;
                  return (
                    <div key={team.id}
                      onClick={() => handleSelectTeam(game.id, team.id)}
                      style={{
                        flex: 1, padding: '7px 10px', borderRadius: 8,
                        cursor: locked ? 'default' : 'pointer',
                        background: on ? `${C.amb}1a` : C.d2,
                        border: `2px solid ${on ? C.amb : 'transparent'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        userSelect: 'none', gap: 6, minWidth: 0,
                      }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, minWidth: 0 }}>
                        <span style={{ fontSize: 22, fontWeight: 900, color: on ? C.amb : C.txt, lineHeight: 1, letterSpacing: -0.5 }}>{team.abbr}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: on ? C.amb : C.mut }}>{fmt(team.spread)}</span>
                      </div>
                      {on && (
                        <div style={{ flexShrink: 0, width: 18, height: 18, borderRadius: 99, background: C.amb, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="9" height="7" viewBox="0 0 11 9" fill="none"><path d="M1 4.5l3 3L10 1" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Points stepper */}
              <div style={{ padding: '6px 10px 8px', display: 'flex', alignItems: 'center', borderTop: `1px solid ${C.bor}`, gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isSel
                    ? <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: C.amb, textTransform: 'uppercase' }}>
                        Points for <strong>{teams.find(t => t.id === isSel)?.abbr}</strong>
                      </span>
                    : <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.8, color: C.mut, textTransform: 'uppercase' }}>Select a team</span>
                  }
                </div>
                <div style={{ display: 'flex', alignItems: 'center', background: C.d2, borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.bor}`, opacity: isSel && !locked ? 1 : 0.3 }}>
                  <button onClick={(e) => { e.stopPropagation(); adj(game.id, -1); }}
                    style={{ width: 36, height: 34, background: 'transparent', border: 'none', borderRight: `1px solid ${C.bor}`, color: C.amb, fontSize: 20, fontWeight: 800, cursor: isSel ? 'pointer' : 'default', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF }}>−</button>
                  <span style={{ width: 40, textAlign: 'center', fontSize: 20, fontWeight: 900, color: C.amb, lineHeight: 1 }}>{isSel ? p : '—'}</span>
                  <button onClick={(e) => { e.stopPropagation(); adj(game.id, 1); }}
                    style={{ width: 36, height: 34, background: 'transparent', border: 'none', borderLeft: `1px solid ${C.bor}`, color: C.amb, fontSize: 20, fontWeight: 800, cursor: isSel ? 'pointer' : 'default', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF }}>+</button>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ height: 4 }} />
      </div>

      {/* Submit button — sits above the fixed LeagueTabBar */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.bor}`, padding: '10px 14px', paddingBottom: 78 }}>
        <button onClick={handleSubmit} disabled={isSubmitting}
          style={{
            width: '100%', padding: '14px', borderRadius: 12,
            background: isReady ? C.amb : '#162035',
            border: `1px solid ${isReady ? 'transparent' : C.bor}`,
            color: isReady ? '#000' : C.mut,
            fontSize: 17, fontWeight: 900, fontFamily: FF,
            letterSpacing: 1, cursor: isReady ? 'pointer' : 'default', textTransform: 'uppercase',
            opacity: isSubmitting ? 0.6 : 1,
          }}>
          {isSubmitting ? 'Submitting…'
            : isReady ? `✓  ${hasExistingSelections ? 'UPDATE PICKS' : 'SUBMIT PICKS'}`
            : ptsLeft > 0 ? `DISTRIBUTE ${ptsLeft} MORE PTS`
            : 'SELECT MORE GAMES'}
        </button>
      </div>

      <LeagueTabBar leagueId={leagueId} />
    </div>
  );
};

export default Picksheet;
