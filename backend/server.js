const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization'
};

app.use(cors(corsOptions));
// Middleware setup
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

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

// Middleware to authenticate token from cookie
const authenticateTokenFromCookie = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    req.session.returnTo = req.originalUrl; // Save the return URL in session
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = user;
    next();
  });
};

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

// Email validation function for common domains
const allowedDomains = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'live.com',
  'protonmail.com',
  'yandex.com'
];

const validateEmailDomain = (email) => {
  const emailDomain = email.split('@')[1];
  return allowedDomains.includes(emailDomain);
};

// Register endpoint with simple email domain validation and password hashing
app.post('/api/register', [
  body('email').isEmail().withMessage('Enter a valid email').custom((value) => {
    if (!validateEmailDomain(value)) {
      throw new Error('Email domain is not allowed');
    }
    return true;
  }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, username, month, day, year, gender, location, email, password, profileImage, educationLevel, personalityTraits, socialPreferences, meetups, values, beliefs, hobbies } = req.body;
  const dob = `${year}-${month}-${day}`;

  console.log('Received registration data:', req.body);

  const checkEmailQuery = 'SELECT email FROM users WHERE email = ?';
  db.query(checkEmailQuery, [email], async (err, results) => {
    if (err) {
      console.error('Database error during email check:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    console.log('Email check results:', results);

    if (results.length > 0) {
      console.log('Email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed Password:', hashedPassword); // Debugging log
    const insertUserQuery = 'INSERT INTO users (name, username, dob, gender, location, email, password, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(insertUserQuery, [name, username, dob, gender, location, email, hashedPassword, profileImage ? profileImage : null], (err, result) => {
      if (err) {
        console.error('Database error during user insertion:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      const userId = result.insertId;
      console.log('Inserted user with ID:', userId); // Debugging log
      const insertPreferencesQuery = 'INSERT INTO preferences (user_id, font_size, theme) VALUES (?, ?, ?)';
      db.query(insertPreferencesQuery, [userId, 'normal', 'light'], (err, result) => {
        if (err) {
          console.error('Database error during preferences insertion:', err);
          return res.status(500).json({ message: 'Error saving preferences', error: err });
        }

        const insertProfileQuery = `
          INSERT INTO profiles (user_id, hobbies, personality, social_preferences, beliefs, meetups, political_view, education_level) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(insertProfileQuery, [userId, JSON.stringify(hobbies), personalityTraits, socialPreferences, beliefs, meetups, values, educationLevel], (err, result) => {
          if (err) {
            console.error('Database error during profile insertion:', err);
            return res.status(500).json({ message: 'Error saving profile', error: err });
          }

          console.log('User registered successfully:', { userId });
          res.json({ message: 'User registered successfully', userId });
        });
      });
    });
  });
});

// Login endpoint
app.post('/api/login', [
  body('email').isEmail(),
  body('password').isLength({ min: 5 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;

  console.log('Login attempt:', { email, password }); // Debugging log

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err); // Debugging log
      return res.status(500).json({ message: 'Server error' });
    }
    console.log('Database query results:', results); // Debugging log
    if (results.length === 0) {
      console.log('User not found'); // Debugging log
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Password comparison error:', err); // Debugging log
        return res.status(500).json({ message: 'Server error' });
      }
      console.log('Password match:', isMatch); // Debugging log
      if (!isMatch) {
        console.log('Invalid password'); // Debugging log
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });
      console.log('Token generated and sent in response:', token); // Debugging log
      res.json({ message: 'Login successful', token });
    });
  });
});


// Profile creation endpoint
app.post('/api/profile', authenticateTokenFromCookie, (req, res) => {
  const { userId, hobbies, personality, socialPreferences, beliefs, meetups, politicalView, educationLevel } = req.body;
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
      INSERT INTO profiles (user_id, hobbies, personality, social_preferences, beliefs, meetups, political_view, education_level) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(insertProfileQuery, [userId, hobbies, personality, socialPreferences, beliefs, meetups, politicalView, educationLevel], (err, result) => {
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
  res.clearCookie('token', { httpOnly: true });
  res.json({ message: 'Logged out successfully' });
});

// Password change endpoint
app.post('/api/change-password', authenticateTokenFromCookie, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  console.log('Password change attempt:', { userId, oldPassword, newPassword });

  const query = 'SELECT password FROM users WHERE id = ?';
  db.query(query, [userId], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    console.log('Database query results:', results);

    if (results.length > 0) {
      const user = results[0];
      const match = await bcrypt.compare(oldPassword, user.password);

      console.log('Old password match:', match);

      if (match) {
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        console.log('Hashed new password:', hashedNewPassword);
        const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';

        db.query(updateQuery, [hashedNewPassword, userId], (err, result) => {
          if (err) {
            console.error('Error updating password:', err);
            return res.status(500).json({ message: 'Server error' });
          }
          console.log('Password updated in database');
          res.json({ message: 'Password changed successfully' });
        });
      } else {
        console.log('Incorrect old password');
        res.status(401).json({ message: 'Invalid password' });
      }
    } else {
      console.log('User not found for password change');
      res.status(404).json({ message: 'User not found' });
    }
  });
});

// Fetch user data (profile pic, preferences)
app.get('/api/user', authenticateTokenFromCookie, (req, res) => {
  console.log('User ID from token:', req.user.id); // Debugging log
  const userId = req.user.id;

  const userQuery = 'SELECT * FROM users WHERE id = ?';
  const profileQuery = 'SELECT * FROM profiles WHERE user_id = ?';
  const preferencesQuery = 'SELECT * FROM preferences WHERE user_id = ?';

  db.query(userQuery, [userId], (err, userResults) => {
    if (err) {
      console.error('Database query error (users):', err); // Debugging log
      return res.status(500).json({ message: 'Server error', error: err });
    }
    if (userResults.length === 0) {
      console.log('User not found'); // Debugging log
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResults[0];

    db.query(profileQuery, [userId], (err, profileResults) => {
      if (err) {
        console.error('Database query error (profiles):', err); // Debugging log
        return res.status(500).json({ message: 'Server error', error: err });
      }

      const profile = profileResults.length > 0 ? profileResults[0] : null;

      db.query(preferencesQuery, [userId], (err, preferencesResults) => {
        if (err) {
          console.error('Database query error (preferences):', err); // Debugging log
          return res.status(500).json({ message: 'Server error', error: err });
        }

        const preferences = preferencesResults.length > 0 ? preferencesResults[0] : null;

        const userData = {
          ...user,
          profile,
          preferences
        };

        console.log('Returning user data:', userData); // Debugging log
        res.json(userData);
      });
    });
  });
});

app.get('/api/preferences/:userId', authenticateTokenFromCookie, (req, res) => {
  const userId = req.params.userId;
  const query = 'SELECT * FROM preferences WHERE user_id = ?';

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Preferences not found' });
    res.json(results[0]);
  });
});

app.post('/api/savePreferences', authenticateTokenFromCookie, (req, res) => {
  const { userId, fontSize, theme } = req.body;
  const updateQuery = 'UPDATE preferences SET font_size = ?, theme = ? WHERE user_id = ?';

  db.query(updateQuery, [fontSize, theme, userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    res.json({ message: 'Preferences saved successfully' });
  });
});

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
