import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import defaultUserImg from '../assets/user.png';
import profileImg from '../assets/profile.png';
import settingImg from '../assets/setting.png';
import helpImg from '../assets/help.png';
import logoutImg from '../assets/logout.png';

const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(defaultUserImg);
  const navigate = useNavigate();

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    // Clear the token from cookies
    document.cookie = 'token=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    navigate('/'); // Redirect to the main homepage after logout
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await fetch('/api/upload-profile-image', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImage(data.profileImageUrl);
      } else {
        console.error('Failed to upload image');
      }
    }
  };

  return (
    <div className="dashboard-hero">
      <nav className="dashboard-nav">
        <ul className="dashboard-nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">Find A New Hive</a></li>
          <li><a href="#">Events Near You</a></li>
          <li><a href="#">Messages</a></li>
        </ul>
        <img src={profileImage} alt="Profile" className="dashboard-profile-pic" onClick={toggleMenu} />
        <div className={`dashboard-sub-menu-wrap ${menuOpen ? 'open-menu' : ''}`} id="subMenu">
          <div className="dashboard-sub-menu">
            <div className="dashboard-user-info">
              <img src={profileImage} alt="User" />
              <h2>User Name</h2>
            </div>
            <hr />
            <a href="#" className="dashboard-sub-menu-link">
              <img src={profileImg} alt="Profile" />
              <p>Profile</p>
              <span>{'>'}</span>
            </a>
            <a href="#" className="dashboard-sub-menu-link">
              <img src={settingImg} alt="Settings" />
              <p>Settings</p>
              <span>{'>'}</span>
            </a>
            <a href="#" className="dashboard-sub-menu-link">
              <img src={helpImg} alt="Help & Support" />
              <p>Help & Support</p>
              <span>{'>'}</span>
            </a>
            <a href="#" className="dashboard-sub-menu-link" onClick={handleLogout}>
              <img src={logoutImg} alt="Logout" />
              <p>Logout</p>
              <span>{'>'}</span>
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
