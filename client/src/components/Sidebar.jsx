import { Link, useParams } from 'react-router-dom';

const Sidebar = () => {
  const { leagueId } = useParams();

  return (
    <div className="sidebar">
      <div className="container">
        <div className="links">
          <Link className="link" to={`/league/${leagueId}`}>
            <h6>League</h6>
          </Link>
          <Link className="link" to={`/league/${leagueId}/picksheet`}>
            <h6>Picksheet</h6>
          </Link>
          <Link className="link" to={`/league/${leagueId}/standings`}>
            <h6>Standings</h6>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
