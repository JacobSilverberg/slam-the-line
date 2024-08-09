import React from 'react';
import { Link } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';

console.log("APIURL:", apiUrl)


const Home = () => {
  return (
    <div className="home">
      <h1>Want to kick your friend&apos;s asses?</h1>
      <h2>Season-long ATS and Pick &apos;em fantasy leagues.</h2>
      <h3>{apiUrl}</h3>
      <span>
        Want to join the fun? <Link to="/register">Register now!</Link>
      </span>
      <span>
        Already a member? <Link to="/login">Login</Link>
      </span>
    </div>
  );
};

export default Home;
