import React, { useState, useEffect } from 'react';
import './Profile.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Profile component
const Profile = () => {
  const [user, setUser] = useState({});
  
  useEffect(() => {
    // Fetch user data here
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setUser(response.data);
    })
    .catch(error => {
      console.error('There was an error fetching the profile data:', error);
    });
  }, []);

  return (
    <div>
      <div className="navbar">
        <div className="navbar-right">
          <Link to="/home" className="active">Home</Link>
          <Link to="/settings">Settings</Link>
          <Link to="/logout">Log Out</Link>
        </div>
      </div>

      <div className="container">
        <div className="header">Profile</div>
        <div className="profile-picture">
          <img src={user.profilePicture || 'path_to_default_profile_picture'} alt="Profile Picture" />
        </div>
        <div className="info-group">
          <label>Username:</label>
          <div className="info">{user.name || 'N/A'}</div>
        </div>
        <div className="info-group">
          <label>Age:</label>
          <div className="info">{user.age || 'N/A'}</div>
        </div>
        <div className="info-group">
          <label>Location:</label>
          <div className="info">{user.location || 'N/A'}</div>
        </div>
        <div className="info-group">
          <label>Highest Education Level Completed:</label>
          <div className="info">{user.educationLevel || 'N/A'}</div>
        </div>
        <div className="info-group">
          <label>Personality Traits:</label>
          <div className="info">{user.personalityTraits || 'N/A'}</div>
        </div>
        <div className="info-group">
          <label>Group Size:</label>
          <div className="info">{user.socialPreferences || 'N/A'}</div>
        </div>
        <div className="info-group">
          <label>Meetups:</label>
          <div className="info">{user.meetups || 'N/A'}</div>
        </div>
        <div className="info-group">
          <label>Values and Beliefs:</label>
          <div className="info">{user.values || 'N/A'}</div>
        </div>
        <div className="info-group">
          <label>Favorite Hobbies:</label>
          <div className="hobbies">
            {user.hobbies ? user.hobbies.split(',').map(hobby => (
              <div className="hobby" key={hobby}>{hobby}</div>
            )) : 'N/A'}
          </div>
        </div>
        <Link to="/edit-profile" className="edit-option">Edit Profile</Link>
      </div>
    </div>
  );
};

export default Profile;
