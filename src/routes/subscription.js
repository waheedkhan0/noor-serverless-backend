const express = require('express');
const store = require('../services/store');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/plans', (req, res) => {
  const plans = store.subscriptionPlans.length > 0
    ? store.subscriptionPlans
    : [
        {
          id: 'p1',
          name: 'Monthly Pro',
          description: 'Ad-free experience, unlimited AI assistant, cloud sync, premium themes.',
          interval: 'month',
          price: 2.99,
          currency: 'USD',
          platform: 'revenuecat',
          product_id: '$rc_monthly',
          trial_days: 7,
          features: { ad_free: true, ai_unlimited: true, cloud_sync: true }
        },
        {
          id: 'p2',
          name: 'Yearly Pro (Best Value)',
          description: 'Full year of unlimited premium features with 30% savings.',
          interval: 'year',
          price: 24.99,
          currency: 'USD',
          platform: 'revenuecat',
          product_id: '$rc_annual',
          trial_days: 14,
          features: { ad_free: true, ai_unlimited: true, cloud_sync: true }
        }
      ];

  res.json({ data: plans });
});

router.get('/my-subscription', optionalAuth, (req, res) => {
  if (!req.user) {
    return res.json({
      is_premium: false,
      status: 'free',
      plan: null,
      expires_at: null
    });
  }

  res.json({
    is_premium: Boolean(req.user.is_premium),
    status: req.user.is_premium ? 'active' : 'free',
    plan: req.user.is_premium ? 'pro' : null,
    expires_at: req.user.is_premium ? '2099-12-31T23:59:59Z' : null,
    platform: 'revenuecat'
  });
});

router.get('/ai-usage', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 'guest';
  const today = new Date().toISOString().split('T')[0];
  const key = `${userId}_${today}`;
  const used = store.aiUsageLogs.get(key) || 0;
  const isPremium = req.user ? Boolean(req.user.is_premium) : false;
  const limit = isPremium ? 999999 : 5;

  res.json({
    used,
    limit,
    remaining: Math.max(0, limit - used),
    is_premium: isPremium,
    reset_at: `${today}T23:59:59Z`
  });
});

router.post('/link-revenuecat', requireAuth, (req, res) => {
  const { revenuecat_id } = req.body || {};
  if (revenuecat_id) {
    req.user.revenuecat_id = revenuecat_id;
    req.user.is_premium = true;
  }
  res.json({ success: true, message: 'RevenueCat account linked successfully' });
});

router.post('/webhook', (req, res) => {
  // RevenueCat webhook ingestion
  const event = req.body?.event;
  if (event && event.app_user_id) {
    const user = store.users.get(event.app_user_id);
    if (user) {
      if (['INITIAL_PURCHASE', 'RENEWAL', 'NON_RENEWING_PURCHASE'].includes(event.type)) {
        user.is_premium = true;
      } else if (['CANCELLATION', 'EXPIRATION'].includes(event.type)) {
        user.is_premium = false;
      }
    }
  }
  res.json({ status: 'ok' });
});

router.post('/create-checkout-session', requireAuth, (req, res) => {
  res.json({
    session_id: store.uuid(),
    url: 'https://noor.app/checkout/mock'
  });
});

router.post('/create-portal-session', requireAuth, (req, res) => {
  res.json({
    url: 'https://noor.app/account/subscription'
  });
});

// ── Cloud Sync ──

router.post('/sync-bookmarks', requireAuth, (req, res) => {
  const bookmarks = req.body.bookmarks || [];
  store.userBookmarks.set(req.user.id, bookmarks);
  store.persistRuntime();
  res.json({ success: true, count: bookmarks.length });
});

router.get('/sync-bookmarks', requireAuth, (req, res) => {
  const bookmarks = store.userBookmarks.get(req.user.id) || [];
  res.json({ bookmarks });
});

router.post('/sync-tasbih', requireAuth, (req, res) => {
  const presets = req.body.presets || [];
  store.userTasbih.set(req.user.id, presets);
  store.persistRuntime();
  res.json({ success: true, count: presets.length });
});

router.get('/sync-tasbih', requireAuth, (req, res) => {
  const presets = store.userTasbih.get(req.user.id) || [];
  res.json({ presets });
});

router.post('/sync-settings', requireAuth, (req, res) => {
  const settings = req.body || {};
  store.userSettings.set(req.user.id, settings);
  store.persistRuntime();
  res.json({ success: true });
});

router.get('/sync-settings', requireAuth, (req, res) => {
  const settings = store.userSettings.get(req.user.id) || {};
  res.json(settings);
});

module.exports = router;
