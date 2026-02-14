const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

// ========== CONFIGURATION ==========

// Check environment variables
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.includes('your-secret')) {
  console.error('❌ ERROR: Please set a proper SESSION_SECRET in .env file');
  process.exit(1);
}

// Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Session configuration (Memory store - works fine for development)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// User context for views
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? {
    id: req.session.userId,
    username: req.session.username
  } : null;
  next();
});

// ========== DATABASE CONNECTION  & SERVER START==========
const PORT = process.env.PORT || 3000;

// Modern Mongoose 7+ connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');

    // ✅ Start server ONLY after DB is connected
    const server = app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Server started on http://localhost:${PORT}`);
      console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: Connected`); // Now this will show correctly!
      console.log(`🍪 Session: ${process.env.SESSION_SECRET ? 'Configured' : 'Not configured'}`);
      console.log('='.repeat(50));
      console.log('\n🔗 Available routes:');
      console.log('   GET  /              → Home (redirects to login/dashboard)');
      console.log('   GET  /login         → Login page');
      console.log('   GET  /register      → Register page');
      console.log('   GET  /dashboard     → User dashboard (requires login)');
      console.log('   GET  /health        → Health check endpoint');
      console.log('   GET  /debug-session → Debug session info');
      console.log('='.repeat(50));
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('💡 Check:');
    console.log('   1. MONGODB_URI in .env is correct');
    console.log('   2. MongoDB Atlas IP whitelist includes 0.0.0.0/0');
    console.log('   3. Database user has correct permissions');
  });

// ========== ROUTES ==========

// Health check (good for deployment)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Debug session endpoint
app.get('/debug-session', (req, res) => {
  res.json({
    sessionId: req.sessionID,
    userId: req.session.userId,
    username: req.session.username,
    cookies: req.headers.cookie
  });
});

// Main routes
app.use('/', authRoutes);
app.use('/', taskRoutes);

// Home redirect
app.get('/', (req, res) => {
  res.redirect(req.session.userId ? '/dashboard' : '/login');
});

// ========== ERROR HANDLING ==========

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The requested page could not be found.'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);
  
  // Don't expose error details in production
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'An unexpected error occurred. Please try again later.';
  
  res.status(500).render('error', {
    title: 'Server Error',
    message
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});