// ProfileSettings.js (update existing code)
import React, { useState, useEffect } from 'react';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const [fontSize, setFontSize] = useState('normal');
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('accessibility');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
    if (token) {
      fetch('/api/preferences', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      })
      .then(response => response.json())
      .then(data => {
        setFontSize(data.font_size);
        setTheme(data.theme);
        setUserId(data.user_id);
      })
      .catch(err => {
        console.error('Error fetching preferences:', err);
      });
    }
  }, []);

  const handleFontSizeChange = (e) => {
    setFontSize(e.target.value);
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const saveSettings = (e) => {
    e.preventDefault();
    const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
    fetch('/api/savePreferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, fontSize, theme }),
    })
    .then(response => response.json())
    .then(data => {
      alert('Settings saved successfully!');
    })
    .catch(err => {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    });
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
              <a href="dashboard">Home</a>
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
                  <a href="#accessibility" data-toggle="tab" className="nav-item nav-link has-icon nav-link-faded" onClick={() => setActiveTab('accessibility')}>
                    Accessibility
                  </a>
                  {/* Add more tabs if necessary */}
                </nav>
              </div>
            </div>
          </div>
          <div className="col-md-8">
            <div className="tab-content">
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
                      <div className="button-group">
                        <button type="submit" className="btn btn-primary">Save Settings</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              {/* Add more tab content if necessary */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileSettings;
