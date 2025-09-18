### BACKEND

1. **Refactor blocking I/O**  
   - `src/routes/items.js` uses `fs.readFileSync`. Replace with non‑blocking async operations.

   In this case, the only thing that I had to do was to substitute the import,
   ```js
      const fs = require('fs');
   ```

   with the asynchronous version

   ```js
   const fs = require('fs').promises; // use the promises API
   ```

   I also had to ensure the data encoding is set to `utf-8` because the async API requires you to be specific about it and I also created a new function `writeData` to keep the functions more consistent since there is a `readData` function too

2. **Performance**  
   - `GET /api/stats` recalculates stats on every request. Cache results, watch file changes, or introduce a smarter strategy.

   First we need to create a cache and some utilities to handle it
   ```js
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
   ```

   > Note: We are using now the mean imported from `backend/src/utils/stats.js`!

   #### What if the items.json changes?
   We need to invalidate the cache so that whenever out 'database' changes, we recalculate the stats:
   ```js
   // Allow external code (e.g. POST /api/items) to reset cache
   function invalidateStatsCache() {
     cache.stats = null;
     cache.lastUpdated = null;
   }

   module.exports = { router, invalidateStatsCache }
   ```

