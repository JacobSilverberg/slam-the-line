import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.tsx';
import apiUrl from '../services/serverConfig.ts';

const C = { bg: '#0c1628', bor: '#1e3354', amb: '#f59e0b', mut: '#475569' } as const;
const FF = "'Barlow Condensed', sans-serif";

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
    { label: 'Picks', path: `/league/${leagueId}/picksheet` },
    { label: 'Standings', path: `/league/${leagueId}/standings` },
    { label: 'Grid', path: `/league/${leagueId}/pickgrid` },
    { label: 'League', path: `/league/${leagueId}` },
    ...(isCommish ? [{ label: 'Commish', path: `/league/${leagueId}/commissioner` }] : []),
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: 64,
      background: C.bg, borderTop: `1px solid ${C.bor}`,
      display: 'flex', alignItems: 'stretch', zIndex: 100,
    }}>
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', fontFamily: FF, fontSize: 13, fontWeight: 700,
              letterSpacing: 0.5, textTransform: 'uppercase',
              color: isActive ? C.amb : C.mut,
              borderTop: isActive ? `2px solid ${C.amb}` : '2px solid transparent',
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
};

export default LeagueTabBar;
