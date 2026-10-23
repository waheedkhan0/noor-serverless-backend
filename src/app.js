const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

// Routes
const authRouter = require('./routes/auth');
const prayerRouter = require('./routes/prayer');
const quranRouter = require('./routes/quran');
const hadithRouter = require('./routes/hadith');
const coursesRouter = require('./routes/courses');
const configRouter = require('./routes/config');
const duasRouter = require('./routes/duas');
const tasbihRouter = require('./routes/tasbih');
const asmaRouter = require('./routes/asma');
const kalmasRouter = require('./routes/kalmas');
const dailyDeenRouter = require('./routes/dailyDeen');
const historicalRouter = require('./routes/historical');
const hajjRouter = require('./routes/hajj');
const zakatRouter = require('./routes/zakat');
const calculatorsRouter = require('./routes/calculators');
const subscriptionRouter = require('./routes/subscription');
const aiRouter = require('./routes/ai');
const feedbackRouter = require('./routes/feedback');
const notificationsRouter = require('./routes/notifications');
const pagesRouter = require('./routes/pages');

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/static', express.static(path.join(__dirname, '../public/static')));
app.use(express.static(path.join(__dirname, '../public')));

// Response time & Request ID tracking
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-ID', requestId);

  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time-Ms', String(duration));
    }
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
    return originalEnd.apply(this, args);
  };
  next();
});

// Health checks
app.get('/healthz', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Noor: Muslim Prayer & Quran',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Noor: Muslim Prayer & Quran',
    version: '1.0.0',
    database: 'connected',
    redis: 'connected',
    serverless: true,
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/auth', authRouter);
app.use('/prayer', prayerRouter);
app.use('/quran', quranRouter);
app.use('/hadith', hadithRouter);
app.use('/courses', coursesRouter);
app.use('/config', configRouter);
app.use('/duas', duasRouter);
app.use('/tasbih', tasbihRouter);
app.use('/asma-ul-husna', asmaRouter);
app.use('/kalmas', kalmasRouter);
app.use('/daily-content', dailyDeenRouter);
app.use('/historical-places', historicalRouter);
app.use('/hajj-guide', hajjRouter);
app.use('/zakat', zakatRouter);
app.use('/calculators', calculatorsRouter);
app.use('/subscription', subscriptionRouter);
app.use('/ai', aiRouter);
app.use('/feedback', feedbackRouter);
app.use('/notifications', notificationsRouter);
app.use('/', pagesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ detail: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    detail: err.message || 'Internal Server Error'
  });
});

module.exports = app;
