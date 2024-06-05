require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const authenticateTokenFromCookie = require('./authMiddleware'); // Import the middleware

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser()); // Use cookie-parser

// MySQL connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('MySQL Connected...');
});

// Register User
app.post('/api/register', [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, age, gender, location, email, password } = req.body;
  const query = 'INSERT INTO users (name, age, gender, location, email, password) VALUES (?, ?, ?, ?, ?, ?)';

  db.query(query, [name, age, gender, location, email, password], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(400).send('Email already exists');
      } else {
        res.status(500).send('Server error');
      }
      return;
    }
    res.send('User registered');
  });
});

// Login User
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
      return;
    }
    if (results.length > 0) {
      const token = jwt.sign({ id: results[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  });
});

// Profile Creation (protected route)
app.post('/api/profile', authenticateTokenFromCookie, (req, res) => {
  const { userId, hobbies, personality, lifestyle, socialPreferences, values, goals } = req.body;
  const query = 'INSERT INTO profiles (user_id, hobbies, personality, lifestyle, social_preferences, `values`, goals) VALUES (?, ?, ?, ?, ?, ?, ?)';

  db.query(query, [userId, hobbies, personality, lifestyle, socialPreferences, values, goals], (err, result) => {
    if (err) throw err;
    res.send('Profile created');
  });
});

// Get User by Email (protected route)
app.get('/api/user/:email', authenticateTokenFromCookie, (req, res) => {
  const { email } = req.params;
  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.json(results[0]); // Return the user data
    } else {
      res.status(404).send('User not found');
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
