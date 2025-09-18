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
