import React from 'react';
import { Link } from 'react-router-dom';
import ConnectHiveLogo from '../assets/ConnectHive_Logo_1.jpeg';
import './CreateNav.css';

const CreateNav = () => {
  return (
    <nav className="create-navbar">
      <Link to="/" className="create-navbar-logo">
        <img src={ConnectHiveLogo} alt="ConnectHive Logo" />
      </Link>
      <div className="auth-buttons">
        <Link to="/login" className="btn">Sign in</Link> 
      </div>
    </nav>
  );
};

export default CreateNav;
