require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Include bcrypt
const helmet = require('helmet');
const authenticateTokenFromCookie = require('./authMiddleware'); // Import the middleware

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser()); // Use cookie-parser to handle cookies
app.use(helmet()); // Use Helmet to set secure HTTP headers

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

// Register User with password hashing
app.post('/api/register', [
  body('email').isEmail().withMessage('Enter a valid email')
    .custom((value) => {
      // Allow only specific email domains
      const allowedDomains = ['hotmail.com', 'yahoo.com', 'gmail.com'];
      const domain = value.split('@')[1];
      if (!allowedDomains.includes(domain)) {
        throw new Error('Email domain not allowed');
      }
      return true;
    }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, age, gender, location, email, password } = req.body;

  // Check if the email already exists
  const checkEmailQuery = 'SELECT email FROM users WHERE email = ?';
  db.query(checkEmailQuery, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // If email is unique, proceed with insertion
    const insertQuery = 'INSERT INTO users (name, age, gender, location, email, password) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(insertQuery, [name, age, gender, location, email, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Server error' });
      }
      res.json({ message: 'User registered' });
    });
  });
});

// Login User with password validation
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
      return;
    }
    if (results.length > 0) {
      const user = results[0];
      // Compare the provided password with the stored hashed password
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.json({ message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Invalid username or password' });
      }
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  });
});


// Profile Creation (protected route)
// Profile Creation (protected route)
app.post('/api/profile', authenticateTokenFromCookie, (req, res) => {
  const { userId, hobbies, personality, lifestyle, socialPreferences, beliefs, goals } = req.body; // Ensure 'beliefs' matches the column in your table

  // Check if the user exists
  const checkUserQuery = 'SELECT id FROM users WHERE id = ?';
  db.query(checkUserQuery, [userId], (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).send('Server error');
    }

    if (results.length === 0) {
      return res.status(400).send('User does not exist');
    }

    // If user exists, proceed to insert the profile
    const insertProfileQuery = `
      INSERT INTO profiles (user_id, hobbies, personality, lifestyle, social_preferences, beliefs, goals) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(insertProfileQuery, [userId, hobbies, personality, lifestyle, socialPreferences, beliefs, goals], (err, result) => {
      if (err) {
        console.error('Error inserting profile:', err);
        return res.status(500).send('Server error');
      }
      res.send('Profile created successfully');
    });
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

// Logout User (clear the token)
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// Improved error handling example for future problems not final
//app.post('/api/some-endpoint', (req, res) => {
 // try {
 // } catch (error) {
  //  console.error('Internal Server Error:', error);
 //   res.status(500).json({ message: 'Internal Server Error' });
//  }
// });
