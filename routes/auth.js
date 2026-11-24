const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Clean up the input: trim spaces, lowercase the email, make sure both are strings
function readCredentials(body) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  return { email, password };
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  const { email, password } = readCredentials(req.body);
  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: 'A valid email is required' });
  }
  // bcrypt only uses the first 72 bytes, so we cap the length
  if (password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: 'Password must be 8–72 characters' });
  }
  try {
    const user = await User.create(email, password);
    res.status(201).json({ message: 'Account created', user });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  const { email, password } = readCredentials(req.body);
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const user = await User.verifyLogin(email, password);
    if (!user) {
      // Same message for wrong email AND wrong password,
      // so attackers can't find out which emails are registered
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;