const express = require('express');
const { getPrayerTimings, getQibla, getHijriCalendar, convertDateGtoH } = require('../services/prayerService');

const router = express.Router();

router.get('/timings', async (req, res) => {
  const { date, latitude, longitude, method, school } = req.query;
  if (!date || latitude === undefined || longitude === undefined) {
    return res.status(422).json({ detail: 'date, latitude, and longitude are required' });
  }

  try {
    const data = await getPrayerTimings(
      date,
      parseFloat(latitude),
      parseFloat(longitude),
      method ? parseInt(method, 10) : 3,
      school ? parseInt(school, 10) : 0
    );
    res.json(data);
  } catch (err) {
    res.status(502).json({ detail: 'Failed to fetch prayer timings' });
  }
});

router.get('/qibla', async (req, res) => {
  const { latitude, longitude } = req.query;
  if (latitude === undefined || longitude === undefined) {
    return res.status(422).json({ detail: 'latitude and longitude are required' });
  }

  try {
    const data = await getQibla(parseFloat(latitude), parseFloat(longitude));
    res.json(data);
  } catch (err) {
    res.status(502).json({ detail: 'Failed to fetch qibla direction' });
  }
});

router.get('/hijri-calendar', async (req, res) => {
  const { year, month, latitude, longitude, method } = req.query;
  if (!year || !month || latitude === undefined || longitude === undefined) {
    return res.status(422).json({ detail: 'year, month, latitude, and longitude are required' });
  }

  try {
    const data = await getHijriCalendar(
      parseInt(year, 10),
      parseInt(month, 10),
      parseFloat(latitude),
      parseFloat(longitude),
      method ? parseInt(method, 10) : 3
    );
    res.json(data);
  } catch (err) {
    res.status(502).json({ detail: 'Failed to fetch hijri calendar' });
  }
});

router.get('/date-convert', async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(422).json({ detail: 'date parameter is required' });
  }

  try {
    const data = await convertDateGtoH(date);
    res.json(data);
  } catch (err) {
    res.status(502).json({ detail: 'Failed to convert date' });
  }
});

module.exports = router;
