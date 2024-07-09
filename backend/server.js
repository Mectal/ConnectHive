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
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }
});

const allowedDomains = [
  'http://localhost:3000',
  'http://localhost:5000'
];

const validateEmailDomain = (email) => {
  const emailDomain = email.split('@')[1];
  const allowedEmailDomains = [
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
  return allowedEmailDomains.includes(emailDomain);
};

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Commenting out origin logging
    // console.log('Origin: ', origin); // Log the origin to see what is being blocked
    if (!origin || allowedDomains.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  credentials: true, // Allow credentials (cookies) to be included
  allowedHeaders: 'Content-Type,Authorization'
};

app.use(cors(corsOptions));
app.use(express.static('public'));


// Middleware setup
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet({ crossOriginResourcePolicy: false }));
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

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

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

// Save a message to the database
app.post('/api/messages', authenticateTokenFromCookie, (req, res) => {
  const { receiver_id, content } = req.body;
  const sender_id = req.user.id;

  const query = 'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)';
  db.query(query, [sender_id, receiver_id, content], (err, result) => {
    if (err) {
      console.error('Error saving message:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json({ message: 'Message saved successfully' });
  });
});

// Fetch messages between two users
app.get('/api/messages/:receiver_id', authenticateTokenFromCookie, (req, res) => {
  const sender_id = req.user.id;
  const { receiver_id } = req.params;

  const query = `
    SELECT m.*, u.username, u.profile_image FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.timestamp ASC
  `;
  db.query(query, [sender_id, receiver_id, receiver_id, sender_id], (err, results) => {
    if (err) {
      console.error('Error fetching messages:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(results);
  });
});

// Endpoint to upload profile image
app.post('/api/upload-profile-image', authenticateTokenFromCookie, upload.single('profileImage'), (req, res) => {
  // Commenting out debugging log
  // console.log('Received file:', req.file); // Debugging log to check file object
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

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

// Serve static files from 'uploads' directory with CORS headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
}));

const usersPool = [];

// Register endpoint with simple email domain validation and password hashing
app.post('/api/register', upload.single('profilePicture'), [
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

  const { name, username, month, day, year, gender, location, email, password, educationLevel, personalityTraits, socialPreferences, meetups, values, beliefs, hobbies } = req.body;
  const dob = `${year}-${month}-${day}`;
  const profileImage = req.file ? `/uploads/${req.file.filename}` : null; // Get profile image path

  // Commenting out debugging logs
  // console.log('Received registration data:', req.body);
  // console.log('Received profile image:', req.file); // Debugging log

  const checkEmailQuery = 'SELECT email FROM users WHERE email = ?';
  db.query(checkEmailQuery, [email], async (err, results) => {
    if (err) {
      console.error('Database error during email check:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    // Commenting out debugging logs
    // console.log('Email check results:', results);

    if (results.length > 0) {
      // console.log('Email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log('Hashed Password:', hashedPassword); // Debugging log
    const insertUserQuery = 'INSERT INTO users (name, username, dob, gender, location, email, password, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(insertUserQuery, [name, username, dob, gender, location, email, hashedPassword, profileImage], (err, result) => {
      if (err) {
        console.error('Database error during user insertion:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      const userId = result.insertId;
      // console.log('Inserted user with ID:', userId); // Debugging log
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

          // Add the user to the matchmaking pool
          usersPool.push({
            id: userId,
            name,
            city: location,
            interests: hobbies,
            group: null
          });

          // Run matchmaking algorithm
          groupPeople(usersPool);

          // console.log('User registered successfully:', { userId });
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

  // Commenting out debugging logs
  // console.log('Login attempt:', { email, password }); // Debugging log

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err); // Debugging log
      return res.status(500).json({ message: 'Server error' });
    }
    // Commenting out debugging logs
    // console.log('Database query results:', results); // Debugging log
    if (results.length === 0) {
      // console.log('User not found'); // Debugging log
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Password comparison error:', err); // Debugging log
        return res.status(500).json({ message: 'Server error' });
      }
      // Commenting out debugging logs
      // console.log('Password match:', isMatch); // Debugging log
      if (!isMatch) {
        // console.log('Invalid password'); // Debugging log
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true, sameSite: 'Strict' });
      // console.log('Token generated and sent in response:', token); // Debugging log
      res.json({ message: 'Login successful', token });
    });
  });
});

// Middleware to authenticate token from cookie
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
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

app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to your dashboard', user: req.user });
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
  res.clearCookie('token', { httpOnly: true, sameSite: 'Strict' });
  res.json({ message: 'Logged out successfully' });
});

// Password change endpoint
app.post('/api/change-password', authenticateTokenFromCookie, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Commenting out debugging logs
  // console.log('Password change attempt:', { userId, oldPassword, newPassword });

  const query = 'SELECT password FROM users WHERE id = ?';
  db.query(query, [userId], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length > 0) {
      const user = results[0];
      const match = await bcrypt.compare(oldPassword, user.password);

      if (match) {
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';

        db.query(updateQuery, [hashedNewPassword, userId], (err, result) => {
          if (err) {
            console.error('Error updating password:', err);
            return res.status(500).json({ message: 'Server error' });
          }
          res.json({ message: 'Password changed successfully' });
        });
      } else {
        res.status(401).json({ message: 'Invalid password' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

// Fetch user data (profile pic, preferences)
app.get('/api/user', authenticateTokenFromCookie, (req, res) => {
  // Commenting out debugging logs
  // console.log('User ID from token:', req.user.id); // Debugging log
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
      // console.log('User not found'); // Debugging log
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

        // Commenting out debugging logs
        // console.log('Returning user data:', userData); // Debugging log
        res.json(userData);
      });
    });
  });
});

// Apply middleware to settings routes
app.use('/api/settings', authenticateTokenFromCookie);

// Save preferences endpoint
app.post('/api/settings/savePreferences', (req, res) => {
  const { userId, fontSize, theme } = req.body;
  // Commenting out debugging logs
  // console.log('Received savePreferences request:', req.body); // Debugging log
  const updateQuery = 'UPDATE preferences SET font_size = ?, theme = ? WHERE user_id = ?';

  db.query(updateQuery, [fontSize, theme, userId], (err, result) => {
    if (err) {
      console.error('Error updating preferences:', err);
      return res.status(500).json({ message: 'Server error', error: err });
    }
    // console.log('Preferences updated successfully for userId:', userId); // Debugging log
    res.json({ message: 'Preferences saved successfully' });
  });
});

// Fetch preferences endpoint
app.get('/api/settings/preferences', (req, res) => {
  const userId = req.user.id;
  // Commenting out debugging logs
  // console.log('Fetching preferences for userId:', userId); // Debugging log
  const query = 'SELECT * FROM preferences WHERE user_id = ?';

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching preferences:', err);
      return res.status(500).json({ message: 'Server error', error: err });
    }
    if (results.length === 0) {
      // console.log('No preferences found for userId:', userId); // Debugging log
      return res.status(404).json({ message: 'Preferences not found' });
    }
    // console.log('Returning preferences:', results[0]); // Debugging log
    res.json(results[0]);
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

// WebSocket setup
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    io.emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Function to calculate compatibility score based on common interests
function calculateCompatibilityScore(interests1, interests2) {
  let commonInterests = interests1.filter(interest => interests2.includes(interest));
  return commonInterests.length;
}

// Function to group people based on city and interests
function groupPeople(people) {
  const groups = [];
  let currentGroup = [];

  // Sort people by city (optional but can help in optimization)
  people.sort((a, b) => (a.city > b.city) ? 1 : ((b.city > a.city) ? -1 : 0));

  // Iterate through people and assign them to groups
  for (let person of people) {
      if (person.group === null) { // Skip already grouped people
          let groupIndex = groups.findIndex(group => group.length < 4 && group.every(p => p.city === person.city || p.interests.some(i => person.interests.includes(i))));

          if (groupIndex !== -1) {
              groups[groupIndex].push(person);
          } else {
              groups.push([person]);
          }
          person.group = groups.length - 1; // Assign group index to person
      }
  }

  // Log the groupings for debugging
  // console.log('Current Groups:', groups.map(group => group.map(person => person.name)));

  return groups;
}

// Fetch group data for a user
app.get('/api/group/:userId', authenticateTokenFromCookie, (req, res) => {
  const userId = req.params.userId;

  const query = 'SELECT * FROM groups WHERE user_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching group data:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: 'Group not found' });
    }
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
