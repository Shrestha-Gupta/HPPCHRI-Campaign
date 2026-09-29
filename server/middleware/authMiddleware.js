/**
 * middleware/authMiddleware.js
 * Verifies the JWT stored in an HttpOnly cookie.
 * All protected admin routes use this middleware.
 */
const jwt = require('jsonwebtoken');

const requireAdmin = (req, res, next) => {
  const token = req.cookies?.adminToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // { adminId, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }
};

module.exports = { requireAdmin };
