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
                <Link className='link' to="/?cat=art">
                    <h6>ART</h6>
                </Link>
                <Link className='link' to="/?cat=tech">
                    <h6>TECH</h6>
                </Link>
                <Link className='link' to="/?cat=cinema">
                    <h6>CINEMA</h6>
                </Link>
                <Link className='link' to="/?cat=design">
                    <h6>DESIGN</h6>
                </Link>
                <span>JOHN</span>
                <span>LOGOUT</span>
                <span className='league'>
                    <Link className='link' to="/league">LEAGUE</Link>
                </span>
            </div>
        </div>
    </div>
  )
}

export default Navbar