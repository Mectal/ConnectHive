require('dotenv').config();
const mysql = require('mysql2');

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

  // Retrieve list of users
  const query = 'SELECT * FROM users';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving users:', err);
      return;
    }
    console.log('List of users:');
    console.log(results);

    // Close the database connection
    db.end();
  });
});

//list  command node listusers.js