const express = require('express');
const {
  getBooks,
  getEditionsByBook,
  getSections,
  getHadithVerse,
  getHadithEdition,
  getEditionSection,
  searchHadiths
} = require('../services/hadithService');
const store = require('../services/store');

const router = express.Router();

router.get('/books', (req, res) => {
  res.json({ data: getBooks() });
});

router.get('/books/:book_slug', (req, res) => {
  res.json({ data: getEditionsByBook(req.params.book_slug) });
});

router.get('/editions', (req, res) => {
  const allEditions = [];
  store.hadithBooks.forEach(b => {
    getEditionsByBook(b.slug).forEach(e => allEditions.push(e));
  });
  res.json({ data: allEditions });
});

router.get('/editions/:edition_slug/sections', (req, res) => {
  res.json({ data: getSections(req.params.edition_slug) });
});

router.get('/search', (req, res) => {
  const { query, edition } = req.query;
  res.json({ data: searchHadiths(query, edition) });
});

router.get('/info', (req, res) => {
  const info = {};
  store.hadithBooks.forEach(b => {
    info[b.slug] = {
      metadata: {
        name: b.name,
        sections: (b.sections || []).reduce((acc, s) => {
          acc[s.id] = s.name;
          return acc;
        }, {})
      }
    };
  });
  res.json(info);
});

router.get('/:edition', async (req, res) => {
  const data = await getHadithEdition(req.params.edition);
  res.json(data);
});

router.get('/:edition/:hadith_number', async (req, res) => {
  const hadithNumber = parseInt(req.params.hadith_number, 10);
  const data = await getHadithVerse(req.params.edition, hadithNumber);
  res.json(data);
});

router.get('/:edition/sections/:section_number', async (req, res) => {
  const data = await getEditionSection(req.params.edition, req.params.section_number);
  res.json(data);
});

module.exports = router;
