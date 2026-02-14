const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { redirectIfAuth } = require('../middleware/auth');

// Middleware for flash messages
router.use((req, res, next) => {
  res.locals.error = req.session.error;
  res.locals.success = req.session.success;
  delete req.session.error;
  delete req.session.success;
  next();
});

// Login Page
router.get('/login', redirectIfAuth, (req, res) => {
  res.render('auth/login', {
     title: 'Login - Todo App',
     error: req.flash ? req.flash('error') : null 
    });
});

// Login Handler
router.post('/login', redirectIfAuth, async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('🔐 Login attempt:', { username });

    // Validation
    if (!username || !password) {
      console.log('❌ Missing credentials');
      req.session.error = 'Username and password are required';
      return res.redirect('/login');
    }
    
    // Find user
    const user = await User.findOne({ username });
    console.log('📊 User found in DB:', user ? 'Yes' : 'No');

    if (!user) {
      console.log(`❌ Login attempt failed: User '${username}' not found`);
      req.session.error = 'Invalid username or password';
      return res.redirect('/login');
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    console.log('🔑 Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log(`❌ Login attempt failed: Incorrect password for '${username}'`);
      req.session.error = 'Invalid username or password';
      return res.redirect('/login');
    }
    
    // Create session
    req.session.userId = user._id;
    req.session.username = user.username;
    
    console.log(`✅ User logged in: ${username} (ID: ${user._id})`);
    req.session.success = 'Welcome back!';
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('❌ Login error:', error);
    req.session.error = 'Something went wrong. Please try again.';
    res.redirect('/login');
  }
});

// Register Page
router.get('/register', redirectIfAuth, (req, res) => {
  res.render('auth/register', { 
    title: 'Register - Todo App',
    error: req.flash ? req.flash('error') : null
   });
});

// Register Handler
router.post('/register', redirectIfAuth, async (req, res) => {
  try {
    // ✅ CORRECT: Destructure all fields from req.body
    const { username, password, confirmPassword } = req.body;

    console.log('📝 Registration attempt:', { 
      username, 
      passwordProvided: !!password,
      confirmPasswordProvided: !!confirmPassword 
    });
    
    // Validation
    if (!username || !password || !confirmPassword) {
      console.log('❌ Missing fields');
      req.session.error = 'Username and password are required';
      return res.redirect('/register');
    }

    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      req.session.error = 'Password do not match';
      return res.redirect('/register');
    }

    if (password.length < 6) {
      console.log('❌ Password too short');
      req.session.error = 'Password must be at least 6 characters';
      return res.redirect('/register');
    }

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('❌ Username already exists');
      req.session.error = 'Username already exists';
      return res.redirect('/register');
    }
    
    // Hash password and Create user
    const hashedPassword =  await bcrypt.hash(password, 10);
    const user = new User({ 
      username, 
      password:  hashedPassword 
    });


    await user.save();
    
    console.log(`✅ User registered successfully: ${username}`);
    req.session.success = 'Registration successful! Please login.';
    res.redirect('/login');
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    req.session.error = 'Registration failed. Please try again.';
    res.redirect('/register');
  }
});

// Logout
router.get('/logout', (req, res) => {
  const username = req.session.username || 'Unknown user';
  console.log(`👋 User logged out: ${username}`);
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;