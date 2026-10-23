const express = require('express');

const router = express.Router();

router.post('/zakat', (req, res) => {
  const b = req.body || {};
  const goldPrice = parseFloat(b.gold_price_per_gram || 85.0);
  const silverPrice = parseFloat(b.silver_price_per_gram || 1.0);

  const nisabGold = 85 * goldPrice;
  const nisabSilver = 595 * silverPrice;

  const goldVal = parseFloat(b.gold_grams || 0) * goldPrice;
  const silverVal = parseFloat(b.silver_grams || 0) * silverPrice;
  const cashBank = parseFloat(b.cash_and_bank || 0);
  const inventory = parseFloat(b.business_inventory || 0);
  const property = parseFloat(b.rental_property_value || 0);
  const liabilities = parseFloat(b.liabilities || 0);

  const total = goldVal + silverVal + cashBank + inventory + property - liabilities;
  const isMet = total >= nisabSilver;
  const due = isMet ? total * 0.025 : 0.0;

  res.json({
    nisab_gold: Math.round(nisabGold * 100) / 100,
    nisab_silver: Math.round(nisabSilver * 100) / 100,
    total_zakatable: Math.round(total * 100) / 100,
    zakat_due: Math.round(due * 100) / 100,
    is_nisab_met: isMet,
    message: isMet ? 'Zakat is due on your assets.' : 'You are below the Nisab threshold. No Zakat is due.'
  });
});

router.post('/inheritance', (req, res) => {
  const b = req.body || {};
  const totalEstate = parseFloat(b.total_estate || 0);
  const shares = [];
  let remaining = totalEstate;

  const hasChildren = b.has_sons || b.has_daughters;

  if (b.has_spouse) {
    const fraction = hasChildren ? (1 / 8) : (1 / 4);
    const amount = totalEstate * fraction;
    shares.push({
      heir: 'Spouse',
      amount: Math.round(amount * 100) / 100,
      percentage: Math.round(fraction * 1000) / 10
    });
    remaining -= amount;
  }

  if (b.has_mother) {
    const fraction = hasChildren ? (1 / 6) : (1 / 3);
    const amount = totalEstate * fraction;
    shares.push({
      heir: 'Mother',
      amount: Math.round(amount * 100) / 100,
      percentage: Math.round(fraction * 1000) / 10
    });
    remaining -= amount;
  }

  if (b.has_father) {
    const fraction = hasChildren ? (1 / 6) : 1;
    const amount = hasChildren ? (totalEstate * fraction) : remaining;
    shares.push({
      heir: 'Father',
      amount: Math.round(amount * 100) / 100,
      percentage: Math.round((amount / totalEstate) * 1000) / 10
    });
    remaining -= amount;
  }

  if (b.has_daughters && !b.has_sons) {
    const fraction = 2 / 3;
    const amount = totalEstate * fraction;
    shares.push({
      heir: 'Daughters',
      amount: Math.round(amount * 100) / 100,
      percentage: Math.round(fraction * 1000) / 10
    });
    remaining -= amount;
  }

  if (b.has_sons) {
    shares.push({
      heir: 'Sons (and Daughters as Asabah)',
      amount: Math.round(remaining * 100) / 100,
      percentage: Math.round((remaining / totalEstate) * 1000) / 10
    });
    remaining = 0;
  }

  if (remaining > 0 && b.has_brothers) {
    shares.push({
      heir: 'Brothers',
      amount: Math.round(remaining * 100) / 100,
      percentage: Math.round((remaining / totalEstate) * 1000) / 10
    });
    remaining = 0;
  } else if (remaining > 0 && b.has_sisters) {
    shares.push({
      heir: 'Sisters',
      amount: Math.round(remaining * 100) / 100,
      percentage: Math.round((remaining / totalEstate) * 1000) / 10
    });
    remaining = 0;
  }

  const distributed = totalEstate - Math.max(0, remaining);

  res.json({
    shares,
    total_distributed: Math.round(distributed * 100) / 100,
    remaining: Math.round(Math.max(0, remaining) * 100) / 100
  });
});

module.exports = router;
