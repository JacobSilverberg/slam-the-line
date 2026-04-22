import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import fetchUserLeagues from '../services/fetchUserLeagues.js';

const CURRENT_NFL_YEAR = parseInt(import.meta.env.VITE_NFL_YEAR || '2025', 10);

const LeagueDropdown = ({ renderType = 'dropdown' }: { renderType?: 'dropdown' | 'list' }) => {
  const { user } = useContext(AuthContext);
  const [leagues, setLeagues] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchUserLeagues(user.userId).then((data) => {
      setLeagues(data.filter((l: any) => l.year === CURRENT_NFL_YEAR));
    });
  }, [user]);

  if (renderType === 'list') {
    return (
      <ul className="league-list">
        {leagues.length > 0 ? (
          leagues.map((l) => (
            <li key={l.league_id}><Link to={`/league/${l.league_id}`}>{l.league_name}</Link></li>
          ))
        ) : (
          <p>You are not currently in any leagues. <Link to="/createleague">Create one now!</Link></p>
        )}
      </ul>
    );
  }

  return (
    <div className="dropdown">
      <span>LEAGUES</span>
      <div className="dropdown-content">
        {leagues.length > 0 ? (
          leagues.map((l) => <Link key={l.league_id} to={`/league/${l.league_id}`}>{l.league_name}</Link>)
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </div>
  );
};

export default LeagueDropdown;
