import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

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
      console.log('Response data:', data);

      if (response.ok) {
        console.log('Login successful');
        document.cookie = `token=${data.token};path=/`;
        navigate('/chat'); // Redirect to ChatPage after successful login
      } else {
        setError(data.message || 'Invalid login');
        console.error('Login error:', data);
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className={styles['login-page']}>
      <div className={styles.container} id="container">
        <div className={`${styles.formContainer} ${styles.signInContainer}`}>
          <form onSubmit={handleSignIn}>
            <h1>Sign in</h1>
            <div className={styles.socialContainer}>
              <a href="#" className={styles.social}><i className="fab fa-facebook-f"></i></a>
              <a href="#" className={styles.social}><i className="fab fa-google-plus-g"></i></a>
              <a href="#" className={styles.social}><i className="fab fa-linkedin-in"></i></a>
            </div>
            <span>or use your account</span>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <div className={styles.infield}>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <label></label>
            </div>
            <div className={styles.infield}>
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <label></label>
            </div>
            <a href="#" className={styles.forgot}>Forgot your password?</a>
            <button type="submit">Sign In</button>
          </form>
        </div>
        <div className={styles.overlayContainer}>
          <div className={styles.overlay}>
            <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
              <h1>Don't have an account?</h1>
              <p>Sign up now and find your Hive!</p>
              <button className={styles.ghost} onClick={() => navigate('/register')}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
