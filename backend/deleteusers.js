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

  // Prompt for the email addresses to delete
  rl.question('Enter the emails of the users to delete (separated by commas or spaces): ', (input) => {
    // Split the input into an array of emails, trimming whitespace
    const emails = input.split(/[\s,]+/).filter(Boolean);
    
    if (emails.length === 0) {
      console.log('No valid emails provided.');
      db.end();
      rl.close();
      return;
    }

    // Prepare the query to delete multiple emails
    const deleteQuery = `DELETE FROM users WHERE email IN (${emails.map(() => '?').join(',')})`;
    
    db.query(deleteQuery, emails, (err, result) => {
      if (err) {
        console.error('Error deleting users:', err);
      } else {
        console.log(`Deleted ${result.affectedRows} user(s) with email(s): ${emails.join(', ')}`);
      }

      // Close the database connection
      db.end();
      rl.close();
    });
  });
});
 // node deleteusers.js and enter email(s) of user(s) who you wish to delete doing username@email and for multiple users 
 // deletions seperate by using a comma username@email, username2@email, username3@email, etc...