const express = require('express');
const store = require('../services/store');

const router = express.Router();

router.get('/presets', (req, res) => {
  res.json(store.tasbihPresets.map(p => ({
    id: String(p.id),
    label: p.label,
    arabic_text: p.arabic_text,
    transliteration: p.transliteration || '',
    translation: p.translation || '',
    default_target: p.default_target || 33,
    display_order: p.display_order || 1
  })));
});

module.exports = router;
