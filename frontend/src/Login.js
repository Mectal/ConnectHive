import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/login', formData)
      .then(response => {
        if (response.status === 200 && response.data.message === 'Login successful') {
          setMessage('Hello');
        } else {
          setMessage('An error occurred. Please try again.');
        }
      })
      .catch(error => {
        if (error.response && error.response.status === 401) {
          setMessage('Invalid username or password');
        } else {
          setMessage('An error occurred. Please try again.');
        }
        console.error('There was an error!', error);
      });
  };

  return (
    <div>
      <h2>Login</h2>
      {message && <p>{message}</p>}
      <form className="form" onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <Link to="/register">Register here</Link></p>
    </div>
  );
};

export default Login;
