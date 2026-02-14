// Check if user is logged in
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    req.flash = req.flash || { error: 'Please login to continue' };
    return res.redirect('/login');
  }
  next();
};

// Redirect if already logged in
const redirectIfAuth = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};

module.exports = { requireAuth, redirectIfAuth };