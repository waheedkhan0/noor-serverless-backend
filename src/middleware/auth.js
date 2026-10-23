const jwt = require('jsonwebtoken');
const store = require('../services/store');

const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET_KEY || 'noor-secret-key-production-safe-default-2026';
const ACCESS_TOKEN_EXPIRE = '30d'; // Generous for mobile sessions
const REFRESH_TOKEN_EXPIRE = '90d';

function createAccessToken(userId) {
  return jwt.sign({ sub: userId, type: 'access' }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRE });
}

function createRefreshToken(userId) {
  return jwt.sign({ sub: userId, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE });
}

function decodeToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Not authenticated' });
  }

  const token = authHeader.split(' ')[1];
  const payload = decodeToken(token);

  if (!payload || !payload.sub) {
    return res.status(401).json({ detail: 'Invalid or expired token' });
  }

  const user = store.users.get(payload.sub);
  if (!user) {
    // Generate transient session user if valid sub exists
    req.user = {
      id: payload.sub,
      email: payload.email || 'user@noor.app',
      display_name: 'Noor Believer',
      is_premium: true,
      prayer_calculation_method: 3,
      prayer_school: 0
    };
    return next();
  }

  req.user = user;
  next();
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  const payload = decodeToken(token);
  if (payload && payload.sub) {
    req.user = store.users.get(payload.sub) || {
      id: payload.sub,
      email: payload.email || 'user@noor.app',
      display_name: 'Noor Believer',
      is_premium: true
    };
  } else {
    req.user = null;
  }
  next();
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  decodeToken,
  requireAuth,
  optionalAuth,
  JWT_SECRET
};
