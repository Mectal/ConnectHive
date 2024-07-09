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
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!tokenCookie) {
      navigate('/login');
    } else {
      const token = tokenCookie.split('=')[1];
      console.log('Token from cookie:', token); // Debugging log
      fetch('http://localhost:5000/api/user', {  // Updated URL to include backend port
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // Ensures cookies are sent with the request
      })
      .then(response => {
        console.log('Fetch response status:', response.status); // Debugging log
        if (response.ok) {
          return response.json();
        } else {
          console.error('Fetch error response:', response); // Debugging log
          throw new Error('Failed to fetch user data');
        }
      })
      .then(data => {
        console.log('Fetched user data:', data); // Debugging log
        if (!data || data.message === 'Unauthorized' || data.message === 'Forbidden') {
          navigate('/login');
        } else {
          setUserData(data);
        }
      })
      .catch(err => {
        console.error('Error fetching user data:', err);
        navigate('/login');
      });
    }
  }, [navigate]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    await fetch('http://localhost:5000/api/logout', {  // Updated URL to include backend port
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Ensures cookies are sent with the request
    });
    document.cookie = 'token=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    navigate('/'); // Redirect to home page
  };

  return (
    <div className="dashboard-hero">
      <nav className="dashboard-nav">
        <ul className="dashboard-nav-links">
          <li><a href="#">Find A New Hive</a></li>
          <li><a href="#">Events Near You</a></li>
          <li><a href="#">MyHive</a></li> 
        </ul>
        <img
          src={userData.profile_image ? `http://localhost:5000${userData.profile_image}` : defaultUserImg}
          alt="Profile"
          className="dashboard-profile-pic"
          onClick={toggleMenu}
        />
        <div className={`dashboard-sub-menu-wrap ${menuOpen ? 'open-menu' : ''}`} id="subMenu">
          <div className="dashboard-sub-menu">
            <div className="dashboard-user-info">
              <img
                src={userData.profile_image ? `http://localhost:5000${userData.profile_image}` : defaultUserImg}
                alt="User"
              />
              <h2>{userData.username || 'User Name'}</h2>
            </div>
            <hr />
            <a href="#" className="dashboard-sub-menu-link">
              <img src={profileImg} alt="Profile" />
              <p>Profile</p>
              <span>{'>'}</span>
            </a>
            <a href="#" className="dashboard-sub-menu-link" onClick={() => navigate('/settings')}>
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
