const express = require('express');
const { getResponse } = require('../services/aiService');
const store = require('../services/store');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/chat', optionalAuth, async (req, res) => {
  const { messages, stream } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(422).json({ detail: 'messages array is required' });
  }

  // Track usage
  const userId = req.user ? req.user.id : 'guest';
  const today = new Date().toISOString().split('T')[0];
  const key = `${userId}_${today}`;
  const used = store.aiUsageLogs.get(key) || 0;
  store.aiUsageLogs.set(key, used + 1);

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reply = await getResponse(messages);
    const words = reply.split(' ');

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < words.length) {
        res.write(`data: ${JSON.stringify({ text: words[idx] + ' ' })}\n\n`);
        idx++;
      } else {
        res.write('data: [DONE]\n\n');
        clearInterval(interval);
        res.end();
      }
    }, 40);

    req.on('close', () => clearInterval(interval));
    return;
  }

  const reply = await getResponse(messages);
  res.json({ response: reply });
});

module.exports = router;
