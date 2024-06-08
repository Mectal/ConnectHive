import React, { useState } from 'react';
import axios from 'axios';

const Profile = ({ userId }) => {
  const [formData, setFormData] = useState({
    hobbies: '',
    personality: '',
    lifestyle: '',
    socialPreferences: '',
    values: '',
    goals: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); // Get the token from local storage

    axios.post('http://localhost:5000/api/profile', { ...formData, userId }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Include the token in the Authorization header
      }
    })
      .then(response => {
        setMessage('Profile created successfully');
        console.log(response.data);
      })
      .catch(error => {
        setMessage('There was an error creating the profile');
        console.error('There was an error!', error);
      });
  };

  return (
    <div>
      <h2>Create Profile</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="hobbies" placeholder="Hobbies" onChange={handleChange} required />
        <input type="text" name="personality" placeholder="Personality" onChange={handleChange} required />
        <input type="text" name="lifestyle" placeholder="Lifestyle" onChange={handleChange} required />
        <input type="text" name="socialPreferences" placeholder="Social Preferences" onChange={handleChange} required />
        <input type="text" name="values" placeholder="Values" onChange={handleChange} required />
        <input type="text" name="goals" placeholder="Goals" onChange={handleChange} required />
        <button type="submit">Create Profile</button>
      </form>
    </div>
  );
};

export default Profile;
