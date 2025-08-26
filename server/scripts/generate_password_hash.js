const bcrypt = require('bcrypt');

// Password for ronny.iss@gmail.com
const password = 'ronnyic123';
const saltRounds = 10;

// Use sync version for simplicity
try {
  const hash = bcrypt.hashSync(password, saltRounds);
  console.log('Password: ' + password);
  console.log('Hash: ' + hash);
  console.log('\nUse this hash in your SQL script.');
} catch (err) {
  console.error('Error generating hash:', err);
}
