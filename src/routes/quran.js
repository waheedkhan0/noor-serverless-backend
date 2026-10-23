const express = require('express');
const {
  getChapters,
  getVerses,
  searchQuran,
  getTafsirEditions,
  getTafsirByChapter,
  getTafsirVerse
} = require('../services/quranService');

const router = express.Router();

router.get('/chapters', async (req, res) => {
  const data = await getChapters();
  res.json(data);
});

router.get('/verses', async (req, res) => {
  const { chapter_id, page, per_page } = req.query;
  if (!chapter_id) {
    return res.status(422).json({ detail: 'chapter_id is required' });
  }

  const data = await getVerses(
    parseInt(chapter_id, 10),
    page ? parseInt(page, 10) : null,
    per_page ? parseInt(per_page, 10) : 10
  );
  res.json(data);
});

router.get('/search', async (req, res) => {
  const query = req.query.query || req.query.q;
  if (!query) {
    return res.status(422).json({ detail: 'query parameter is required' });
  }

  const data = await searchQuran(query, req.query.language || 'en');
  res.json(data);
});

router.get('/tafsir-editions', async (req, res) => {
  const data = await getTafsirEditions();
  res.json(data);
});

router.get('/tafsir/:slug/:chapter', async (req, res) => {
  const { slug, chapter } = req.params;
  const data = await getTafsirByChapter(slug, parseInt(chapter, 10));
  res.json(data);
});

router.get('/tafsir/:slug/:chapter/:verse', async (req, res) => {
  const { slug, chapter, verse } = req.params;
  const data = await getTafsirVerse(slug, parseInt(chapter, 10), parseInt(verse, 10));
  if (!data) {
    return res.status(404).json({ detail: 'Tafsir verse not found' });
  }
  res.json(data);
});

router.get('/tafsir-external', async (req, res) => {
  const { chapter_id, verse_key, tafsir_id } = req.query;
  const tafsirSlug = tafsir_id === '170' ? 'en-al-jalalayn' : 'en-tafisr-ibn-kathir';
  const parts = (verse_key || '').split(':');
  const chapter = parseInt(parts[0] || chapter_id || '1', 10);
  const verse = parseInt(parts[1] || '1', 10);

  const data = await getTafsirVerse(tafsirSlug, chapter, verse);
  res.json(data || { chapter, verse, text: 'Tafsir unavailable for this verse.' });
});

module.exports = router;
