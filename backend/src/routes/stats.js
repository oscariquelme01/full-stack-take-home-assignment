const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { mean } = require('../utils/stats');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

// cache to hold the stats
let cache = {
  stats: null,
  lastUpdated: null
};

async function computeStats() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  const items = JSON.parse(raw);

  // calculate the stats
  const stats = {
    total: items.length,
    averagePrice: items.length
      ? mean(items)
      : 0
  };

  cache.stats = stats;
  cache.lastUpdated = Date.now();

  return stats;
}

async function getStats() {
  if (cache.stats) {
    return cache.stats;
  }
  return computeStats();
}

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
