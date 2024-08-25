import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';
import LeagueDropdown from './LeagueDropdown';

import Logo from '../assets/STL_Logo.webp';

const Navbar = () => {
  const { logout } = React.useContext(AuthContext);

  return (
    <div className="navbar">
      <div className="container">
        <div className="logo">
          <Link to="/">
            <img src={Logo} alt="Logo" />
          </Link>
        </div>

        <div className="links">
          <LeagueDropdown />
          <span onClick={logout}>LOGOUT</span>
          <span className="home">
            <Link className="link" to="/">
              HOME
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
