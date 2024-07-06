import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.module.css';

// Login component
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('Response data:', data); // Debugging line to check the response data

      if (response.ok) {
        console.log('Login successful'); // Debugging line to confirm successful login
        document.cookie = `token=${data.token};path=/`;
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid login');
        console.error('Login error:', data); // Debugging line to check error details
      }
    } catch (err) {
      console.error('Error during login:', err); // Debugging line to check error details
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="container" id="container">
      <div className="form-container sign-in-container">
        <form onSubmit={handleSignIn}>
          <h1>Sign in</h1>
          <div className="social-container">
            <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
            <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
          </div>
          <span>or use your account</span>
          {error && <div className="error-message">{error}</div>}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <a href="#" className="forgot">Forgot your password?</a>
          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
