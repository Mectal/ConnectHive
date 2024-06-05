const crypto = require('crypto');

const generateSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

const secret = generateSecret();
console.log(`Generated JWT Secret: ${secret}`);
