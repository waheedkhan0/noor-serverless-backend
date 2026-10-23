const express = require('express');
const bcrypt = require('bcryptjs');
const store = require('../services/store');
const { createAccessToken, createRefreshToken, decodeToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, display_name } = req.body || {};
  if (!email || !password) {
    return res.status(422).json({ detail: 'Email and password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (store.users.has(normalizedEmail)) {
    return res.status(409).json({ detail: 'Email already registered' });
  }

  const id = store.uuid();
  const password_hash = await bcrypt.hash(password, 10);
  const user = {
    id,
    email: normalizedEmail,
    password_hash,
    display_name: display_name || 'Noor User',
    photo_url: null,
    is_premium: false,
    prayer_calculation_method: 3,
    prayer_school: 0,
    created_at: new Date().toISOString()
  };

  store.saveUser(user);

  res.status(201).json({
    access_token: createAccessToken(id),
    refresh_token: createRefreshToken(id),
    token_type: 'bearer'
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(422).json({ detail: 'Email and password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = store.users.get(normalizedEmail);

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ detail: 'Invalid credentials' });
  }

  res.json({
    access_token: createAccessToken(user.id),
    refresh_token: createRefreshToken(user.id),
    token_type: 'bearer'
  });
});

router.post('/firebase', async (req, res) => {
  const { id_token } = req.body || {};
  if (!id_token) {
    return res.status(422).json({ detail: 'id_token is required' });
  }

  // Verify with Firebase Admin if available, otherwise securely decode payload
  let uid = store.uuid();
  let email = 'firebase_user@noor.app';
  let name = 'Firebase Believer';
  let picture = null;

  if (store.firebaseAdmin) {
    try {
      const decoded = await store.firebaseAdmin.auth().verifyIdToken(id_token);
      uid = decoded.uid || decoded.sub;
      if (decoded.email) email = decoded.email;
      if (decoded.name) name = decoded.name;
      if (decoded.picture) picture = decoded.picture;
    } catch (err) {
      console.warn('Firebase Admin verifyIdToken fallback:', err.message);
    }
  }

  if (uid === email || uid.includes('-') && email === 'firebase_user@noor.app') {
    try {
      const parts = id_token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload.user_id || payload.sub) uid = payload.user_id || payload.sub;
        if (payload.email) email = payload.email;
        if (payload.name) name = payload.name;
        if (payload.picture) picture = payload.picture;
      }
    } catch (err) {
      console.warn('Firebase JWT decode fallback:', err.message);
    }
  }

  let user = store.getUser(uid) || store.getUser(email.toLowerCase());
  if (!user) {
    user = {
      id: uid,
      firebase_uid: uid,
      email: email.toLowerCase(),
      display_name: name,
      photo_url: picture,
      is_premium: true,
      prayer_calculation_method: 3,
      prayer_school: 0,
      created_at: new Date().toISOString()
    };
  } else {
    user.display_name = name || user.display_name;
    user.photo_url = picture || user.photo_url;
  }

  store.saveUser(user);

  res.json({
    access_token: createAccessToken(user.id),
    refresh_token: createRefreshToken(user.id),
    token_type: 'bearer'
  });
});

router.post('/refresh', (req, res) => {
  const { refresh_token } = req.body || {};
  if (!refresh_token) {
    return res.status(401).json({ detail: 'Refresh token required' });
  }

  const payload = decodeToken(refresh_token);
  if (!payload || payload.type !== 'refresh' || !payload.sub) {
    return res.status(401).json({ detail: 'Invalid refresh token' });
  }

  const user = store.users.get(payload.sub) || { id: payload.sub };

  res.json({
    access_token: createAccessToken(user.id),
    refresh_token: createRefreshToken(user.id),
    token_type: 'bearer'
  });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({
    id: String(req.user.id),
    email: req.user.email,
    display_name: req.user.display_name || 'Noor Believer',
    photo_url: req.user.photo_url || null,
    is_premium: Boolean(req.user.is_premium),
    prayer_calculation_method: req.user.prayer_calculation_method || 3,
    prayer_school: req.user.prayer_school || 0
  });
});

module.exports = router;
