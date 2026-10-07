import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  // Sign the token with the user's ID and our secret key, expiring in 30 days
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;