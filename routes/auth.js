const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET: Show registration form
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// POST: Register new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || username.length < 3) {
      return res.render('register', { error: '⚠️ Username must be at least 3 characters.' });
    }

    if (!password || password.length < 6) {
      return res.render('register', { error: '⚠️ Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.render('register', { error: '⚠️ That username is already taken.' });
    }

    const user = new User({ username, password });
    await user.save();

    req.session.user = user;
    res.redirect('/');
  } catch (err) {
    console.error('❌ Registration failed:', err);
    res.render('register', { error: '⚠️ Unexpected error: ' + err.message });
  }
});

// GET: Show login form
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// POST: Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await user.comparePassword(password))) {
    return res.render('login', { error: '⚠️ Invalid username or password' });
  }

  req.session.user = user;
  res.redirect('/');
});

// POST: Logout user
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
