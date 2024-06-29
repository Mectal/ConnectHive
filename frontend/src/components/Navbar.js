import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Make sure your CSS paths are correct
import ConnectHiveLogo from '../assets/ConnectHive_Logo_1.jpeg';

const Navbar = () => {
    return (
        <nav>
            <img src={ConnectHiveLogo} className="logo" alt="ConnectHive Logo" />
            <ul>
                <li><Link to="/features">features</Link></li>
                <li><Link to="/how-it-works">How it works</Link></li>
                <li><Link to="/privacy">Privacy</Link></li>
                <li><Link to="/contact-us">Contact Us</Link></li>
                <li><Link to="/safety">Safety</Link></li>
            </ul>
            <div>
                <Link to="/login" className="login-btn">Sign in</Link>
                <Link to="#" className="btn">Download App</Link> 
            </div>
        </nav>
    );
};

export default Navbar;
