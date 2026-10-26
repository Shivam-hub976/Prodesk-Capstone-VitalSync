import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  // Sign the token with the user's ID and our secret key, expiring in 1 day
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

export default generateToken;