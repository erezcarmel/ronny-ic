const bcrypt = require('bcrypt');

// Replace with the password you want to hash
const password = 'my_secure_password';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  console.log('Password hash for', password + ':', hash);
  console.log('\nUse this hash in your SQL script.');
});
