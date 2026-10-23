const express = require('express');
const store = require('../services/store');

const router = express.Router();

router.post('/register-token', (req, res) => {
  const token = req.body.token || req.body.fcm_token;
  if (token) {
    store.notificationsTokens.add(token);
  }
  res.json({ success: true, message: 'Token registered' });
});

router.post('/subscribe', (req, res) => {
  const { tokens, topic } = req.body || {};
  if (topic && Array.isArray(tokens)) {
    if (!store.topicSubscriptions.has(topic)) {
      store.topicSubscriptions.set(topic, new Set());
    }
    const topicSet = store.topicSubscriptions.get(topic);
    tokens.forEach(t => topicSet.add(t));
  }
  res.json({ success: true, message: `Subscribed to ${topic}` });
});

router.post('/unsubscribe', (req, res) => {
  const { tokens, topic } = req.body || {};
  if (topic && Array.isArray(tokens) && store.topicSubscriptions.has(topic)) {
    const topicSet = store.topicSubscriptions.get(topic);
    tokens.forEach(t => topicSet.delete(t));
  }
  res.json({ success: true, message: `Unsubscribed from ${topic}` });
});

router.post('/send', (req, res) => {
  res.json({ success: true, message: 'Notification queued' });
});

module.exports = router;
