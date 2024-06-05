require('dotenv').config();
const mysql = require('mysql2');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
    rl.close();
    return;
  }
  console.log('MySQL Connected...');

  rl.question('Enter the email of the user to delete: ', (email) => {
    const deleteQuery = 'DELETE FROM users WHERE email = ?';
    
    db.query(deleteQuery, [email], (err, result) => {
      if (err) {
        console.error('Error deleting user:', err);
      } else {
        console.log(`Deleted user with email: ${email}`);
      }

      // Close the database connection
      db.end();
      rl.close();
    });
  });
});

// del command deleteusers.js and enter email of who you want to delete 