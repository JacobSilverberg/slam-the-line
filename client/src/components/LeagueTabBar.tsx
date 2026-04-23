import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.tsx';
import apiUrl from '../services/serverConfig.ts';

const C = { bg: '#0c1628', bor: '#1e3354', amb: '#f59e0b', mut: '#94a3b8' } as const;
const FF = "'Barlow Condensed', sans-serif";

const sv = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const TabIcon = ({ name, size = 18 }: { name: string; size?: number }) => {
  if (name === 'picks') return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...sv}>
      <ellipse cx="12" cy="12" rx="9" ry="5.5" transform="rotate(-45 12 12)" />
      <line x1="7.5" y1="16.5" x2="16.5" y2="7.5" />
      <line x1="10" y1="11" x2="13" y2="14" />
      <line x1="12.5" y1="8.5" x2="15.5" y2="11.5" />
    </svg>
  );
  if (name === 'standings') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="13" width="4" height="8" rx="1" fill="currentColor" />
      <rect x="10" y="8" width="4" height="13" rx="1" fill="currentColor" />
      <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor" />
    </svg>
  );
  if (name === 'grid') return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...sv}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
  if (name === 'league') return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...sv}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
  if (name === 'commish') return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...sv}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
  return null;
};

const LeagueTabBar = ({ leagueId }: { leagueId: string | undefined }) => {
  const { user } = useContext(AuthContext);
  const [isCommish, setIsCommish] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!user || !leagueId) return;
    axios.get(`${apiUrl}/getuserleaguerole/${leagueId}/user/${user.userId}`)
      .then((res) => setIsCommish(res.data.league_role === 'commish'))
      .catch(() => {});
  }, [leagueId, user]);

  const tabs = [
    { label: 'Picks', icon: 'picks', path: `/league/${leagueId}/picksheet` },
    { label: 'Standings', icon: 'standings', path: `/league/${leagueId}/standings` },
    { label: 'Grid', icon: 'grid', path: `/league/${leagueId}/pickgrid` },
    { label: 'League', icon: 'league', path: `/league/${leagueId}` },
    ...(isCommish ? [{ label: 'Commish', icon: 'commish', path: `/league/${leagueId}/commissioner` }] : []),
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: C.bg, borderTop: `1px solid ${C.bor}`, zIndex: 100,
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', height: 64, display: 'flex', alignItems: 'stretch' }}>
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 3, paddingTop: 2, textDecoration: 'none', fontFamily: FF, fontSize: 10, fontWeight: 700,
                letterSpacing: 0.5, textTransform: 'uppercase',
                color: isActive ? C.amb : C.mut,
                borderTop: isActive ? `2px solid ${C.amb}` : '2px solid transparent',
              }}
            >
              <TabIcon name={tab.icon} size={18} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default LeagueTabBar;
