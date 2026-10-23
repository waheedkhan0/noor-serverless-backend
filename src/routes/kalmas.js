const express = require('express');
const store = require('../services/store');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(store.kalmas.map(k => ({
    id: String(k.id),
    name: k.name,
    name_arabic: k.name_arabic,
    arabic_text: k.arabic_text,
    transliteration: k.transliteration,
    translations: k.translations || {},
    benefits: k.benefits || '',
    audio_url: k.audio_url || null,
    display_order: k.display_order || 1
  })));
});

router.get('/:kalma_id', (req, res) => {
  const kalma = store.kalmas.find(
    k => String(k.id) === req.params.kalma_id || String(k.display_order) === req.params.kalma_id
  );
  if (!kalma) {
    return res.status(404).json({ detail: 'Kalma not found' });
  }

  res.json({
    id: String(kalma.id),
    name: kalma.name,
    name_arabic: kalma.name_arabic,
    arabic_text: kalma.arabic_text,
    transliteration: kalma.transliteration,
    translations: kalma.translations || {},
    benefits: kalma.benefits || '',
    audio_url: kalma.audio_url || null
  });
});

module.exports = router;
