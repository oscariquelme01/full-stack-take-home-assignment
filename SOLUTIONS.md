## BACKEND

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

3. **Testing**  
   - Add **unit tests** (Jest) for items routes (happy path + error cases).

   The tests are written using `Jest` and `SuperTest`. I will admit that the boiler plate was written by AI. However, this are the list of test I would write myself:
   - It should return correct stats
   - It should use cached stats on subsequent calls
   - It should recompute stats after cache invalidation

   Test are run with `npm test` inside the backend directory


#### Limitations and final thoughts on the backend
- The test suite is comprehensible but more cases could be added
- I didn't implement file watching as I feel like invalidating a cache from other endpoints sounds like a better, more realistic idea
- Time based cache invalidation could be implemented
- The test suite updates our database!! that is a terrible practice that I implemented because of time constraints but a better idea would be to mock the `items.json` file



## FRONTEND

1. **Memory Leak**  
   - `Items.js` leaks memory if the component unmounts before fetch completes. Fix it.

   `Items.js` is leaking memory because the component might unmount before the fetch completes. There is no simple solution achieved by just changing this file, we need to go to our `state/DataProvider` and change this lines:

   ```js
    const fetchItems = useCallback(async () => {
      const res = await fetch('http://localhost:3001/api/items?limit=500'); // Intentional bug: backend ignores limit
      const json = await res.json();
      setItems(json);
    }, []);
    ```

    to this:

    ```js
      const fetchItems = useCallback(async () => {
        const res = await fetch('http://localhost:3001/api/items?limit=500');
        const json = await res.json();
        return json; // Return the data instead of setting state directly, separation of concerns!!
      }, []);
    ```

    This let's our `Items` component react to the state however it wants to. In this case, we just need to check the `active` flag and only call set items when the flag is set to true

    ```js
        // fetchItems now returns a promise that resolves with the data
        fetchItems()
          .then(fetchedItems => {
            // Check if the component is still mounted before setting state
            if (active) {
              setItems(fetchedItems);
            }
          })
          .catch(console.error);
      ```

