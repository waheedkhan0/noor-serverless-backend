const express = require('express');
const store = require('../services/store');

const router = express.Router();

router.get('/categories', (req, res) => {
  const cats = new Set();
  store.historicalPlaces.forEach(p => {
    if (p.category) cats.add(p.category);
  });
  if (cats.size === 0) {
    cats.add('Makkah');
    cats.add('Madinah');
    cats.add('Jerusalem');
    cats.add('Historical Battles');
  }
  res.json(Array.from(cats));
});

router.get('/', (req, res) => {
  const { category } = req.query;
  let items = store.historicalPlaces;
  if (category && category.toLowerCase() !== 'all') {
    items = items.filter(p => (p.category || '').toLowerCase() === category.toLowerCase());
  }

  res.json(items.map(p => ({
    id: String(p.id),
    name: p.name,
    name_arabic: p.name_arabic,
    category: p.category,
    description: p.description,
    significance: p.significance || '',
    latitude: p.latitude,
    longitude: p.longitude,
    image_urls: p.image_urls || [],
    thumbnail_url: p.thumbnail_url || (p.image_urls && p.image_urls[0]) || null,
    display_order: p.display_order || 1
  })));
});

router.get('/:place_id', (req, res) => {
  const place = store.historicalPlaces.find(p => String(p.id) === req.params.place_id);
  if (!place) {
    return res.status(404).json({ detail: 'Place not found' });
  }

  res.json({
    id: String(place.id),
    name: place.name,
    name_arabic: place.name_arabic,
    category: place.category,
    description: place.description,
    significance: place.significance || '',
    latitude: place.latitude,
    longitude: place.longitude,
    image_urls: place.image_urls || [],
    thumbnail_url: place.thumbnail_url || (place.image_urls && place.image_urls[0]) || null
  });
});

module.exports = router;
