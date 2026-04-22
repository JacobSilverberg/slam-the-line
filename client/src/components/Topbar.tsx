import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import apiUrl from '../services/serverConfig.js';

const Topbar = ({ leagueId }: { leagueId: string | undefined }) => {
  const { user } = useContext(AuthContext);
  const [isCommish, setIsCommish] = useState(false);

  useEffect(() => {
    if (!user || !leagueId) return;
    axios.get(`${apiUrl}/getuserleaguerole/${leagueId}/user/${user.userId}`)
      .then((res) => setIsCommish(res.data.league_role === 'commish'))
      .catch(() => {});
  }, [leagueId, user]);

  return (
    <div className="top-bar">
      <div className="container">
        <div className="links">
          <Link className="link" to={`/league/${leagueId}/picksheet`}><h6>Picksheet</h6></Link>
          <Link className="link" to={`/league/${leagueId}/standings`}><h6>Standings</h6></Link>
          <Link className="link" to={`/league/${leagueId}/pickgrid`}><h6>Pick Grid</h6></Link>
          <Link className="link" to={`/league/${leagueId}`}><h6>League Details</h6></Link>
          {isCommish && <Link className="link" to={`/league/${leagueId}/commissioner`}><h6>Commissioner</h6></Link>}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
