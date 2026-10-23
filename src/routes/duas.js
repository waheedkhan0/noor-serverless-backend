const express = require('express');
const store = require('../services/store');

const router = express.Router();

router.get('/categories', (req, res) => {
  res.json(store.duaCategories.map(c => ({
    id: String(c.id),
    name: c.name,
    name_arabic: c.name_arabic,
    icon: c.icon,
    description: c.description,
    display_order: c.display_order
  })));
});

router.get('/categories-with-duas', (req, res) => {
  const result = store.duaCategories.map(cat => {
    const catDuas = store.duas.filter(d => String(d.category_id) === String(cat.id));
    return {
      id: String(cat.id),
      name: cat.name,
      name_arabic: cat.name_arabic,
      icon: cat.icon,
      description: cat.description,
      display_order: cat.display_order,
      duas: catDuas.map(d => ({
        id: String(d.id),
        category_id: String(cat.id),
        arabic_text: d.arabic_text,
        transliteration: d.transliteration,
        translations: d.translations || {},
        reference: d.reference || '',
        reference_detail: d.reference_detail || '',
        benefit: d.benefit || '',
        audio_url: d.audio_url || null,
        repetition_count: d.repetition_count || 1,
        display_order: d.display_order || 1
      }))
    };
  });

  res.json(result);
});

router.get('/', (req, res) => {
  const { category_id } = req.query;
  let items = store.duas;
  if (category_id) {
    items = items.filter(d => String(d.category_id) === String(category_id));
  }

  res.json(items.map(d => ({
    id: String(d.id),
    category_id: String(d.category_id),
    arabic_text: d.arabic_text,
    transliteration: d.transliteration,
    translations: d.translations || {},
    reference: d.reference || '',
    reference_detail: d.reference_detail || '',
    benefit: d.benefit || '',
    audio_url: d.audio_url || null,
    repetition_count: d.repetition_count || 1,
    display_order: d.display_order || 1
  })));
});

router.get('/:dua_id', (req, res) => {
  const dua = store.duas.find(d => String(d.id) === req.params.dua_id);
  if (!dua) {
    return res.status(404).json({ detail: 'Dua not found' });
  }

  res.json({
    id: String(dua.id),
    category_id: String(dua.category_id),
    arabic_text: dua.arabic_text,
    transliteration: dua.transliteration,
    translations: dua.translations || {},
    reference: dua.reference || '',
    reference_detail: dua.reference_detail || '',
    benefit: dua.benefit || '',
    audio_url: dua.audio_url || null,
    repetition_count: dua.repetition_count || 1
  });
});

module.exports = router;
