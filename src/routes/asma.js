const express = require('express');
const store = require('../services/store');

const router = express.Router();

router.get('/', (req, res) => {
  const { query } = req.query;
  let items = store.asmaUlHusna;

  if (query) {
    const q = query.toLowerCase().trim();
    items = items.filter(n =>
      (n.name_arabic && n.name_arabic.includes(q)) ||
      (n.transliteration && n.transliteration.toLowerCase().includes(q)) ||
      (n.meaning && n.meaning.toLowerCase().includes(q))
    );
  }

  res.json(items.map(n => ({
    id: String(n.id),
    name_arabic: n.name_arabic,
    transliteration: n.transliteration,
    meaning: n.meaning,
    explanation: n.explanation || '',
    quran_references: n.quran_references || [],
    audio_url: n.audio_url || null,
    display_order: n.display_order || 1
  })));
});

router.get('/daily', (req, res) => {
  if (store.asmaUlHusna.length === 0) {
    return res.status(404).json({ detail: 'No names available' });
  }

  // Consistent daily name based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const index = dayOfYear % store.asmaUlHusna.length;
  const name = store.asmaUlHusna[index];

  res.json({
    id: String(name.id),
    name_arabic: name.name_arabic,
    transliteration: name.transliteration,
    meaning: name.meaning,
    explanation: name.explanation || '',
    quran_references: name.quran_references || [],
    audio_url: name.audio_url || null
  });
});

router.get('/:name_id', (req, res) => {
  const name = store.asmaUlHusna.find(
    n => String(n.id) === req.params.name_id || String(n.display_order) === req.params.name_id
  );
  if (!name) {
    return res.status(404).json({ detail: 'Name not found' });
  }

  res.json({
    id: String(name.id),
    name_arabic: name.name_arabic,
    transliteration: name.transliteration,
    meaning: name.meaning,
    explanation: name.explanation || '',
    quran_references: name.quran_references || [],
    audio_url: name.audio_url || null
  });
});

module.exports = router;
