import React from 'react'
import { Link } from 'react-router-dom'
import Logo from "../assets/logo.png"

const Navbar = () => {
  return (
    <div className='navbar'>
        <div className="container">
            <div className="logo">
                <img src={Logo} alt="Logo" />
            </div>
            <div className="links">
                <Link className='link' to="/league">
                    <h6>LEAGUES</h6>
                </Link>
                <Link className='link' to="/?cat=tech">
                    <h6>SCHEDULE</h6>
                </Link>
                <span>JOHN</span>
                <span>LOGOUT</span>
                <span className='home'>
                    <Link className='link' to="/">HOME</Link>
                </span>
            </div>
        </div>
    </div>
  )
}

export default Navbar