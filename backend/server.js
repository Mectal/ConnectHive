// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const authenticateTokenFromCookie = require('./authMiddleware');
const multer = require('multer');
const path = require('path');
const axios = require('axios'); // Import axios for making HTTP requests
require('dotenv').config();

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use(helmet());

// Database connection
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

// Multer storage setup for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Endpoint to upload profile image
app.post('/api/upload-profile-image', authenticateTokenFromCookie, upload.single('profileImage'), (req, res) => {
  const userId = req.user.id;
  const profileImageUrl = `/uploads/${req.file.filename}`;

  const updateQuery = 'UPDATE users SET profile_image = ? WHERE id = ?';
  db.query(updateQuery, [profileImageUrl, userId], (err, result) => {
    if (err) {
      console.error('Error updating profile image:', err);
      return res.status(500).send('Server error');
    }
    res.json({ message: 'Profile image updated successfully', profileImageUrl });
  });
});

// Serve static files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ZeroBounce email validation function
async function validateEmail(email) {
  const apiKey = process.env.ZERBOUNCE_API_KEY;
  const url = `https://api.zerobounce.net/v2/validate?api_key=${apiKey}&email=${encodeURIComponent(email)}`;
  
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error validating email:', error);
    throw new Error('Email validation failed');
  }
}

// Register endpoint with email validation and password hashing
app.post('/api/register', [
  body('email').isEmail().withMessage('Enter a valid email')
    .custom(async (value) => {
      // Validate email using ZeroBounce API
      const validationResponse = await validateEmail(value);
      if (validationResponse.status !== 'valid') { // Adjust this based on ZeroBounce's response
        throw new Error('Email is not valid');
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

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email }); // Log the email attempt
  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    console.log('Database query results:', results);
    if (results.length > 0) {
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      console.log('Password match:', match);
      if (match) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        console.log('Token generated and sent in response:', token); // Log the token
        return res.json({ message: 'Login successful', token }); // Include the token in the response
      } else {
        console.log('Invalid password');
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  });
});

// Profile creation endpoint
app.post('/api/profile', authenticateTokenFromCookie, (req, res) => {
  const { userId, hobbies, personality, lifestyle, socialPreferences, beliefs, goals } = req.body;
  const checkUserQuery = 'SELECT id FROM users WHERE id = ?';
  db.query(checkUserQuery, [userId], (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).send('Server error');
    }

    if (results.length === 0) {
      return res.status(400).send('User does not exist');
    }

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

// Fetch user data by email
app.get('/api/user/:email', authenticateTokenFromCookie, (req, res) => {
  const { email } = req.params;
  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send('User not found');
    }
  });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'Logged out successfully' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
