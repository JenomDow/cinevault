const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Show register form
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Register user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.render('register', { error: 'Username already exists' });
    }
    const user = new User({ username, password });
    await user.save();
    req.session.user = user;
    res.redirect('/');
  } catch (err) {
    res.render('register', { error: 'Registration failed' });
  }
});

// Show login form
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    return res.render('login', { error: 'Invalid credentials' });
  }
  req.session.user = user;
  res.redirect('/');
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
