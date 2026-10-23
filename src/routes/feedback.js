const express = require('express');
const store = require('../services/store');
const { optionalAuth, requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', optionalAuth, (req, res) => {
  const { feedback_type, title, description, reference_info } = req.body || {};
  if (!feedback_type || !title || !description) {
    return res.status(422).json({ detail: 'feedback_type, title, and description are required' });
  }

  const feedback = {
    id: store.uuid(),
    user_id: req.user ? req.user.id : null,
    feedback_type,
    title,
    description,
    reference_info: reference_info || null,
    status: 'open',
    created_at: new Date().toISOString()
  };

  store.feedbackItems.unshift(feedback);
  res.status(201).json(feedback);
});

router.get('/', requireAuth, (req, res) => {
  const list = store.feedbackItems.filter(f => f.user_id === req.user.id);
  res.json(list);
});

router.get('/:feedback_id', requireAuth, (req, res) => {
  const item = store.feedbackItems.find(f => f.id === req.params.feedback_id);
  if (!item) {
    return res.status(404).json({ detail: 'Feedback not found' });
  }
  res.json(item);
});

module.exports = router;
