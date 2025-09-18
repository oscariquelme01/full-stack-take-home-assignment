const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { mean } = require('../utils/stats');
const { writeFileSync } = require('fs');
const statsRouter = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// cache to hold the stats
let cache = {
  stats: null,
  lastUpdated: null
};

async function computeStats() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  const items = JSON.parse(raw);

  await fs.appendFile('log.txt', `items: ${JSON.stringify(items)}`)

  // calculate the stats
  const stats = {
    total: items.length,
    averagePrice: items.length
      ? mean(items.map((item) => item.price))
      : 0
  };

  cache.stats = stats;
  cache.lastUpdated = Date.now();

  return stats;
}

async function getStats() {
  if (cache.stats) {
    await fs.appendFile('log.txt', 'Returning stats from cache\n')
    return cache.stats;
  }

  await fs.appendFile('log.txt', 'Computing stats\n')
  return computeStats();
}

function invalidateStatsCache() {
 cache.stats = null;
 cache.lastUpdated = null;
}

// GET /api/stats
statsRouter.get('/', async (req, res, next) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = { statsRouter, invalidateStatsCache };
