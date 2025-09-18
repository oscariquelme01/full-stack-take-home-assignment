const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs').promises;

// Import the router we built
const { statsRouter, invalidateStatsCache } = require('../src/routes/stats');

const DATA_PATH = path.join(__dirname, '../../data/items.json');

describe('/api/stats endpoint', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use('/api/stats', statsRouter);
  });

  beforeEach(async () => {
    // Reset cache between tests
    invalidateStatsCache();

    // Prepare a test dataset
    const items = [
      { id: 1, name: 'Item A', price: 10 },
      { id: 2, name: 'Item B', price: 20 },
      { id: 3, name: 'Item C', price: 30 }
    ];
    await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2));
  });

  it('should return correct stats', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      total: 3,
      averagePrice: 20
    });
  });

  it('should use cached stats on subsequent calls', async () => {
    const first = await request(app).get('/api/stats');
    expect(first.statusCode).toBe(200);

    // Overwrite items.json with nonsense — should be ignored due to cache
    await fs.writeFile(DATA_PATH, JSON.stringify([], null, 2));

    const second = await request(app).get('/api/stats');
    expect(second.body).toEqual(first.body); // still cached
  });

  it('should recompute stats after cache invalidation', async () => {
    const first = await request(app).get('/api/stats');
    expect(first.body.total).toBe(3);

    // Update dataset
    const newItems = [
      { id: 1, name: 'Only item', price: 100 }
    ];
    await fs.writeFile(DATA_PATH, JSON.stringify(newItems, null, 2));

    // Invalidate cache manually
    invalidateStatsCache();

    const second = await request(app).get('/api/stats');
    expect(second.body).toEqual({
      total: 1,
      averagePrice: 100
    });
  });
});
