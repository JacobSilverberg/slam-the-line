import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import fetchUserLeagues from '../services/fetchUserLeagues.js';
import apiUrl from '../services/serverConfig.js';

const CURRENT_NFL_YEAR = parseInt(import.meta.env.VITE_NFL_YEAR || '2025', 10);
const DEFAULT_LEAGUE_ID = import.meta.env.VITE_DEFAULT_LEAGUE_ID || null;

const Home = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [teamName, setTeamName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    fetchUserLeagues(user.userId).then((data) => {
      setLeagues(data.filter((l: any) => l.year === CURRENT_NFL_YEAR));
    });
  }, [isAuthenticated, user]);

  const handleJoinDefaultLeague = () => {
    if (!teamName.trim() || !DEFAULT_LEAGUE_ID || !user) return;

    axios
      .post(`${apiUrl}/leagueregistration/${DEFAULT_LEAGUE_ID}/users/${user.userId}`, {
        league_role: 'owner',
        team_name: teamName,
      })
      .then(() => {
        navigate(`/league/${DEFAULT_LEAGUE_ID}`);
      })
      .catch((err) => {
        alert(err.response?.data?.msg || 'Error registering for the league.');
      });
  };

  if (isAuthenticated) {
    return (
      <div className="home">
        <h1>Welcome Back!</h1>
        <h2>Here&apos;s Your Current Leagues</h2>
        <ul className="league-list">
          {leagues.length > 0 ? (
            leagues.map((league) => (
              <li key={league.league_id}>
                <Link to={`/league/${league.league_id}/picksheet`}>{league.league_name}</Link>
              </li>
            ))
          ) : (
            <p>
              You are not currently in any leagues.{' '}
              <Link to="/createleague">Create one now!</Link>
            </p>
          )}
        </ul>
        <div className="league-options">
          {DEFAULT_LEAGUE_ID && (
            <>
              <h3>Joining the Betting League Year 7?</h3>
              <p>Enter your team name and click the link below to register!</p>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter your team name"
              />
              <button
                className="cta-button"
                onClick={handleJoinDefaultLeague}
                disabled={!teamName.trim()}
              >
                Join the Betting League!
              </button>
            </>
          )}
          <h3>Want to create your own league?</h3>
          <p>You can create a custom league with your own rules and invite your friends to join.</p>
          <Link to="/createleague" className="cta-button">Create a League</Link>
          <h3>Looking to join an existing league?</h3>
          <p>Search for a league using a league code provided by your friends and join the competition.</p>
          <Link to="/joinleague" className="cta-button">Join a League</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <h1>Get Ready to Slam The Line!</h1>
      <Link to="/login" className="cta-button">Log in</Link>
      <h2>Compete with Friends in the Ultimate Season-Long ATS Betting Pool</h2>
      <p>
        Join &quot;Slam The Line&quot; and dive into a thrilling season-long adventure where you pick
        against the spread every week. Challenge your friends, track your progress, and see who reigns supreme.
      </p>
      <p>
        No more juggling multiple apps and spreadsheets. &quot;Slam The Line&quot; brings everything you need
        into one seamless experience. Ready to start?
      </p>
      <Link to="/register" className="cta-button">Register</Link>
    </div>
  );
};

export default Home;
