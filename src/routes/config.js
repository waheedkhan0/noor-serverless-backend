const express = require('express');
const store = require('../services/store');

const router = express.Router();

router.get('/app', (req, res) => {
  res.json(store.appConfig);
});

router.get('/content', (req, res) => {
  const grouped = {
    announcements: [
      {
        id: store.uuid(),
        content_type: 'announcement',
        title: 'Welcome to Noor',
        body: store.appConfig.announcement || 'May Allah bless your recitation and prayers.',
        image_url: null,
        link_url: null,
        priority: 10,
        extra_data: {}
      }
    ],
    features: [
      {
        id: store.uuid(),
        content_type: 'features',
        title: 'New Feature: AI Islamic Assistant',
        body: 'Ask verified questions about Quran and Sunnah.',
        image_url: null,
        link_url: '/ai-chat',
        priority: 5,
        extra_data: {}
      }
    ]
  };
  res.json(grouped);
});

router.get('/content/:content_type', (req, res) => {
  const { content_type } = req.params;
  const items = [
    {
      id: store.uuid(),
      content_type,
      title: `${content_type.toUpperCase()} Item`,
      body: 'Verified Islamic content for Noor users.',
      image_url: null,
      link_url: null,
      priority: 1,
      extra_data: {}
    }
  ];
  res.json(items);
});

module.exports = router;
