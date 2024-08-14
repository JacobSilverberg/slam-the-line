import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import getUserId from '../services/getUserId';
import fetchUserLeagues from '../services/fetchUserLeagues';

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    const userId = getUserId();

    const getLeagues = async () => {
      const leaguesData = await fetchUserLeagues(userId);
      setLeagues(leaguesData);
    };

    if (isAuthenticated) {
      getLeagues();
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return (
      <div className="home">
        <h1>Welcome Back!</h1>
        <h2>Here's Your Current Leagues</h2>
        <ul className="league-list">
          {leagues.length > 0 ? (
            leagues.map((league) => (
              <li key={league.league_id}>
                <Link to={`/league/${league.league_id}`}>{league.league_name}</Link>
              </li>
            ))
          ) : (
            <p>You are not currently in any leagues. <Link to="/createleague">Create one now!</Link></p>
          )}
        </ul>
        <div className="league-options">
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
      <h2>Compete with Friends in the Ultimate Season-Long ATS Betting Pool</h2>
      <p>Join "Slam The Line" and dive into a thrilling season-long adventure where you pick against the spread every week. Challenge your friends, track your progress, and see who reigns supreme.</p>
      <p>No more juggling multiple apps and spreadsheets. "Slam The Line" brings everything you need into one seamless experience. Ready to start?</p>
      <Link to="/login" className="cta-button">Log in</Link>
      <Link to="/register" className="cta-button">Join the Competition</Link>
    </div>
  );
};

export default Home;
