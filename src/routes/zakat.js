const express = require('express');
const store = require('../services/store');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/nisab', (req, res) => {
  const latest = store.nisabRecords[0] || {
    gold_price_per_gram: 85.0,
    silver_price_per_gram: 1.0,
    gold_nisab: 7225.0,
    silver_nisab: 595.0,
    currency: 'USD',
    source: 'default',
    is_admin_override: false
  };

  res.json({
    id: String(latest.id || store.uuid()),
    gold_price_per_gram: latest.gold_price_per_gram || 85.0,
    silver_price_per_gram: latest.silver_price_per_gram || 1.0,
    gold_nisab: latest.gold_nisab || 7225.0,
    silver_nisab: latest.silver_nisab || 595.0,
    currency: latest.currency || 'USD',
    fetched_at: new Date().toISOString(),
    source: latest.source || 'default',
    is_admin_override: Boolean(latest.is_admin_override)
  });
});

router.post('/calculate', optionalAuth, (req, res) => {
  const b = req.body || {};
  const goldGrams = parseFloat(b.gold_grams || 0);
  const silverGrams = parseFloat(b.silver_grams || 0);
  const cashBank = parseFloat(b.cash_and_bank || 0);
  const businessInventory = parseFloat(b.business_inventory || 0);
  const rentalProperty = parseFloat(b.rental_property_value || 0);
  const investments = parseFloat(b.investments || 0);
  const agricultural = parseFloat(b.agricultural_value || 0);
  const livestock = parseFloat(b.livestock_value || 0);
  const liabilities = parseFloat(b.liabilities || 0);

  const goldPrice = parseFloat(b.gold_price_per_gram || 85.0);
  const silverPrice = parseFloat(b.silver_price_per_gram || 1.0);

  const nisabSilver = 595 * silverPrice;
  const nisabGold = 85 * goldPrice;

  const goldVal = goldGrams * goldPrice;
  const silverVal = silverGrams * silverPrice;
  const totalAssets = goldVal + silverVal + cashBank + businessInventory + rentalProperty + investments + agricultural + livestock;
  const netAssets = totalAssets - liabilities;
  const zakatableAmount = Math.max(0, netAssets);
  const isMet = zakatableAmount >= nisabSilver;
  const zakatDue = isMet ? zakatableAmount * 0.025 : 0.0;

  const record = {
    id: store.uuid(),
    user_id: req.user ? req.user.id : null,
    total_assets: Math.round(totalAssets * 100) / 100,
    total_liabilities: Math.round(liabilities * 100) / 100,
    zakatable_amount: Math.round(zakatableAmount * 100) / 100,
    zakat_due: Math.round(zakatDue * 100) / 100,
    nisab_threshold: Math.round(nisabSilver * 100) / 100,
    calculated_at: new Date().toISOString()
  };

  store.zakatHistory.unshift(record);

  res.json({
    nisab_gold: Math.round(nisabGold * 100) / 100,
    nisab_silver: Math.round(nisabSilver * 100) / 100,
    total_assets: Math.round(totalAssets * 100) / 100,
    total_liabilities: Math.round(liabilities * 100) / 100,
    zakatable_amount: Math.round(zakatableAmount * 100) / 100,
    zakat_due: Math.round(zakatDue * 100) / 100,
    is_nisab_met: isMet,
    message: isMet ? 'Zakat is due.' : 'Below Nisab threshold.'
  });
});

router.get('/history', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : null;
  const list = userId
    ? store.zakatHistory.filter(r => r.user_id === userId)
    : store.zakatHistory.slice(0, 10);
  res.json(list);
});

module.exports = router;
