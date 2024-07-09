import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const [fontSize, setFontSize] = useState('normal');
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('accessibility');
  const navigate = useNavigate();

  useEffect(() => {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!tokenCookie) {
      navigate('/login');
    } else {
      const token = tokenCookie.split('=')[1];
      fetch('http://localhost:5000/api/settings/preferences', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch preferences');
        }
      })
      .then(data => {
        if (!data || data.message === 'Unauthorized' || data.message === 'Forbidden') {
          navigate('/login');
        } else {
          setFontSize(data.font_size);
          setTheme(data.theme);
          applySettings(data.font_size, data.theme);
        }
      })
      .catch(err => {
        navigate('/login');
      });
    }
  }, [navigate]);

  const handleFontSizeChange = (e) => {
    const newSize = e.target.value;
    setFontSize(newSize);
    applySettings(newSize, theme);
  };

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    applySettings(fontSize, newTheme);
  };

  const saveSettings = (e) => {
    e.preventDefault();
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      fetch('http://localhost:5000/api/settings/savePreferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ fontSize, theme }),
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to save settings');
        }
      })
      .then(data => {
        alert('Settings saved successfully!');
        applySettings(fontSize, theme);
      })
      .catch(err => {
        alert('Failed to save settings');
      });
    } else {
      navigate('/login');
    }
  };

  const applySettings = (fontSize, theme) => {
    let fontSizeMultiplier;
    switch (fontSize) {
      case 'largest':
        fontSizeMultiplier = 1.6;
        break;
      case 'large':
        fontSizeMultiplier = 1.4;
        break;
      default:
        fontSizeMultiplier = 1.1;
        break;
    }
    document.body.style.fontSize = `${fontSizeMultiplier}em`;

    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  };

  return (
    <>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>User Profile Settings</title>
      <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet" />
      <div className="container">
        <nav aria-label="breadcrumb" className="main-breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="chat">Home</a>
            </li>
            <li className="breadcrumb-item">
              <a href="javascript:void(0)">User</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Profile Settings
            </li>
          </ol>
        </nav>
        <div className="row gutters-sm">
          <div className="col-md-4 d-none d-md-block">
            <div className="card mb-3">
              <div className="card-body">
                <nav className="nav flex-column nav-pills nav-gap-y-1 custom-nav">
                  <a href="#communication" data-toggle="tab" className="nav-item nav-link has-icon nav-link-faded" onClick={() => setActiveTab('communication')}>
                    Communication
                  </a>
                  <a href="#security" data-toggle="tab" className="nav-item nav-link has-icon nav-link-faded" onClick={() => setActiveTab('security')}>
                    Security
                  </a>
                  <a href="#payments" data-toggle="tab" className="nav-item nav-link has-icon nav-link-faded" onClick={() => setActiveTab('payments')}>
                    Payments
                  </a>
                  <a href="#notifications" data-toggle="tab" className="nav-item nav-link has-icon nav-link-faded" onClick={() => setActiveTab('notifications')}>
                    Notifications
                  </a>
                  <a href="#support" data-toggle="tab" className="nav-item nav-link has-icon nav-link-faded" onClick={() => setActiveTab('support')}>
                    Support
                  </a>
                  <a href="#accessibility" data-toggle="tab" className="nav-item nav-link has-icon nav-link-faded" onClick={() => setActiveTab('accessibility')}>
                    Accessibility
                  </a>
                  <a href="#legal" data-toggle="tab" className="nav-item nav-link has-icon nav-link-faded" onClick={() => setActiveTab('legal')}>
                    Legal
                  </a>
                </nav>
              </div>
            </div>
          </div>
          <div className="col-md-8">
            <div className="tab-content">
              <div className={`tab-pane fade ${activeTab === 'communication' ? 'show active' : ''}`} id="communication">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Group Settings</h5>
                    <button className="btn btn-primary mb-3">Favorite Groups</button>
                    <button className="btn btn-primary mb-3">Leave Group</button>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Chat Settings</h5>
                    <button className="btn btn-primary mb-3">Restricted Words/Phrases</button>
                    <button className="btn btn-primary mb-3">Change Language</button>
                    <button className="btn btn-primary mb-3">Image/GIF Configuration</button>
                  </div>
                </div>
              </div>
              <div className={`tab-pane fade ${activeTab === 'security' ? 'show active' : ''}`} id="security">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Security</h5>
                    <button className="btn btn-primary mb-3">Change Password</button>
                  </div>
                </div>
              </div>
              <div className={`tab-pane fade ${activeTab === 'payments' ? 'show active' : ''}`} id="payments">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Change Subscription and Payment settings</h5>
                    <button className="btn btn-primary mb-3">Subscription Management</button>
                    <button className="btn btn-primary mb-3">Payment Methods</button>
                    <button className="btn btn-primary mb-3">Purchase History</button>
                  </div>
                </div>
              </div>
              <div className={`tab-pane fade ${activeTab === 'notifications' ? 'show active' : ''}`} id="notifications">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Notification Preferences</h5>
                    <form>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" value="" id="defaultCheck1" />
                        <label className="form-check-label" htmlFor="defaultCheck1">Push Notifications</label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" value="" id="defaultCheck2" />
                        <label className="form-check-label" htmlFor="defaultCheck2">Email Notifications</label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" value="" id="defaultCheck3" />
                        <label className="form-check-label" htmlFor="defaultCheck3">Event Notifications</label>
                      </div>
                      <button type="submit" className="btn btn-primary">Save Preferences</button>
                    </form>
                  </div>
                </div>
              </div>
              <div className={`tab-pane fade ${activeTab === 'support' ? 'show active' : ''}`} id="support">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Request assistance from the administrators</h5>
                    <form>
                      <div className="form-group">
                        <label htmlFor="feedback">Report Issue</label>
                        <input type="text" className="form-control" id="feedback" placeholder="Problems, Issues, or Concerns" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="feedbackEmail">Email</label>
                        <input type="text" className="form-control" id="feedbackEmail" placeholder="Your Email" />
                      </div>
                      <button type="submit" className="btn btn-primary">Submit Report</button>
                    </form>
                  </div>
                </div>
              </div>
              <div className={`tab-pane fade ${activeTab === 'accessibility' ? 'show active' : ''}`} id="accessibility">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Accessibility Settings</h5>
                    <form onSubmit={saveSettings}>
                      <div className="form-group">
                        <label htmlFor="theme">Theme:</label>
                        <div className="form-check">
                          <input className="form-check-input" type="radio" name="theme" id="themeLight" value="light" checked={theme === 'light'} onChange={handleThemeChange} />
                          <label className="form-check-label" htmlFor="themeLight">Light Theme</label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="radio" name="theme" id="themeDark" value="dark" checked={theme === 'dark'} onChange={handleThemeChange} />
                          <label className="form-check-label" htmlFor="themeDark">Dark Theme</label>
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="font">Font:</label>
                        <div className="form-check">
                          <input className="form-check-input" type="radio" name="font" id="fontNormal" value="normal" checked={fontSize === 'normal'} onChange={handleFontSizeChange} />
                          <label className="form-check-label" htmlFor="fontNormal">Normal</label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="radio" name="font" id="fontLarge" value="large" checked={fontSize === 'large'} onChange={handleFontSizeChange} />
                          <label className="form-check-label" htmlFor="fontLarge">Large</label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="radio" name="font" id="fontLargest" value="largest" checked={fontSize === 'largest'} onChange={handleFontSizeChange} />
                          <label className="form-check-label" htmlFor="fontLargest">Largest</label>
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary">Save Settings</button>
                    </form>
                  </div>
                </div>
              </div>
              <div className={`tab-pane fade ${activeTab === 'legal' ? 'show active' : ''}`} id="legal">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Legal</h5>
                    <button className="btn btn-primary mb-3">Terms of Service</button>
                    <button className="btn btn-primary mb-3">Privacy Policy</button>
                    <button className="btn btn-primary mb-3">Licenses</button>
                    <button className="btn btn-primary mb-3">About Us</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileSettings;
