import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
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
