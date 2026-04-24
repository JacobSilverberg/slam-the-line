import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import LeagueTabBar from '../components/LeagueTabBar.tsx';
import apiUrl from '../services/serverConfig.ts';

const C = {
  bg: '#0c1628', card: '#152540', d2: '#1a2d4a',
  amb: '#f59e0b', txt: '#e2e8f0', mut: '#94a3b8', bor: '#1e3354',
} as const;
const FF = "'Barlow Condensed', sans-serif";
const FFb = "'Barlow', sans-serif";

const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 0', borderBottom: `1px solid ${C.bor}`,
  }}>
    <span style={{ fontFamily: FFb, fontSize: 14, color: C.mut }}>{label}</span>
    <span style={{ fontFamily: FF, fontSize: 17, fontWeight: 900, color: C.txt, textTransform: 'uppercase', letterSpacing: 0.3 }}>{value}</span>
  </div>
);

const League = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const [leagueInfo, setLeagueInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get(`${apiUrl}/leagueinfo/${leagueId}`)
      .then((res) => setLeagueInfo(res.data.league[0]))
      .catch((err) => console.error('Error fetching league:', err))
      .finally(() => setIsLoading(false));
  }, [leagueId]);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: FF }}>
      <div style={{
        background: 'linear-gradient(160deg, #1a3a7a 0%, #0e1e3d 100%)',
        padding: '20px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 99, background: 'rgba(129,140,248,0.08)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: C.amb, letterSpacing: 3, textTransform: 'uppercase', fontFamily: FFb, marginBottom: 2, position: 'relative', zIndex: 1 }}>League Info</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: -0.5, position: 'relative', zIndex: 1 }}>
          {isLoading ? '...' : leagueInfo?.name}
        </div>
      </div>

      {!isLoading && leagueInfo && (
        <div style={{ padding: '16px 20px 88px' }}>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginBottom: 14, textDecoration: 'none',
            fontFamily: FFb, fontSize: 13, fontWeight: 700,
            color: C.mut, textTransform: 'uppercase', letterSpacing: 0.8,
          }}>
            ‹ My Leagues
          </Link>
          <div style={{ background: C.card, borderRadius: 12, padding: '0 16px', border: `1px solid ${C.bor}` }}>
            <InfoRow label="Sport" value={leagueInfo.sport?.toUpperCase()} />
            <InfoRow label="Season" value={leagueInfo.year} />
            <InfoRow label="Weekly Points" value={leagueInfo.weekly_points} />
            <InfoRow label="Min Picks / Week" value={leagueInfo.games_select_min} />
            <InfoRow label="Max Picks / Week" value={leagueInfo.games_select_max} />
            <InfoRow label="League Type" value={leagueInfo.type} />
          </div>
        </div>
      )}

      <LeagueTabBar leagueId={leagueId} />
    </div>
  );
};

export default League;
