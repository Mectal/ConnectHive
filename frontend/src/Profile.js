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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/profile', { ...formData, userId })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="hobbies" placeholder="Hobbies" onChange={handleChange} required />
      <input type="text" name="personality" placeholder="Personality" onChange={handleChange} required />
      <input type="text" name="lifestyle" placeholder="Lifestyle" onChange={handleChange} required />
      <input type="text" name="socialPreferences" placeholder="Social Preferences" onChange={handleChange} required />
      <input type="text" name="values" placeholder="Values" onChange={handleChange} required />
      <input type="text" name="goals" placeholder="Goals" onChange={handleChange} required />
      <button type="submit">Create Profile</button>
    </form>
  );
};

export default Profile;
