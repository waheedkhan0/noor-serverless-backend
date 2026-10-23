const express = require('express');
const store = require('../services/store');

const router = express.Router();

router.get('/', (req, res) => {
  const targetDate = req.query.dt || req.query.date || new Date().toISOString().split('T')[0];

  const items = store.dailyContent.map((item, idx) => ({
    id: String(item.id || store.uuid()),
    content_type: item.content_type || 'verse',
    title: item.title || 'Daily Islamic Reflection',
    arabic_text: item.arabic_text || '',
    translations: item.translations || {},
    source: item.source || 'Quran & Sunnah',
    scheduled_date: targetDate,
    is_recurring: item.is_recurring !== undefined ? item.is_recurring : true
  }));

  res.json(items);
});

module.exports = router;
