const express = require('express');
const store = require('../services/store');

const router = express.Router();

router.get('/steps', (req, res) => {
  res.json(store.hajjSteps.map(s => ({
    id: String(s.id),
    step_number: s.step_number,
    title: s.title,
    title_arabic: s.title_arabic || '',
    descriptions: s.descriptions || {},
    duas: s.duas || [],
    common_mistakes: s.common_mistakes || [],
    diagrams: s.diagrams || [],
    video_url: s.video_url || null
  })));
});

router.get('/umrah/steps', (req, res) => {
  res.json(store.umrahSteps.map(s => ({
    id: String(s.id),
    step_number: s.step_number,
    title: s.title,
    title_arabic: s.title_arabic || '',
    descriptions: s.descriptions || {},
    duas: s.duas || [],
    common_mistakes: s.common_mistakes || [],
    diagrams: s.diagrams || [],
    video_url: s.video_url || null
  })));
});

router.get('/checklist/categories', (req, res) => {
  const cats = new Set();
  store.hajjChecklist.forEach(i => {
    if (i.category) cats.add(i.category);
  });
  if (cats.size === 0) {
    cats.add('documents');
    cats.add('clothing');
    cats.add('health');
    cats.add('essentials');
    cats.add('electronics');
  }
  res.json(Array.from(cats));
});

router.get('/checklist', (req, res) => {
  const { category } = req.query;
  let items = store.hajjChecklist;
  if (category) {
    items = items.filter(i => (i.category || '').toLowerCase() === category.toLowerCase());
  }

  res.json(items.map(i => ({
    id: String(i.id),
    category: i.category,
    item_name: i.item_name,
    item_name_arabic: i.item_name_arabic || '',
    is_essential: Boolean(i.is_essential),
    notes: i.notes || null,
    display_order: i.display_order || 1
  })));
});

module.exports = router;
