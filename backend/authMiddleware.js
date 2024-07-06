const jwt = require('jsonwebtoken');

function authenticateTokenFromCookie(req, res, next) {
  const token = req.cookies.token;

  console.log('Token from cookie:', token); // Debugging log

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification error:', err); // Debugging log
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateTokenFromCookie;
