
// this script resets all user profiles and profile creation for members can test profile creation using Postman 
// which allows members to reset all id numbers starting from 1 instead of 3 and incrementing.
// ONLY USE FOR TESTING PROFILE CREATIONAS ALL EXISTING USERS AND PROFILES WILL BE DELETED!!!

require('dotenv').config();
const mysql = require('mysql2');

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

  // Step 1: Delete all rows from profiles table
  const deleteProfilesQuery = 'DELETE FROM profiles';

  db.query(deleteProfilesQuery, (err, result) => {
    if (err) {
      console.error('Error deleting profiles:', err);
      db.end();
      return;
    }

    console.log(`Deleted ${result.affectedRows} profile(s)`);

    // Step 2: Delete all rows from users table
    const deleteUsersQuery = 'DELETE FROM users';

    db.query(deleteUsersQuery, (err, result) => {
      if (err) {
        console.error('Error deleting users:', err);
        db.end();
        return;
      }

      console.log(`Deleted ${result.affectedRows} user(s)`);

      // Step 3: Reset the auto-increment value for users table
      const resetAutoIncrementQuery = 'ALTER TABLE users AUTO_INCREMENT = 1';

      db.query(resetAutoIncrementQuery, (err, result) => {
        if (err) {
          console.error('Error resetting auto-increment value:', err);
        } else {
          console.log('Auto-increment value reset.');
        }

        // Close the database connection
        db.end();
      });
    });
  });
});
