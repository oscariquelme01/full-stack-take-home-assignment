import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);

  const fetchItems = useCallback(async () => {
    const res = await fetch('http://localhost:3001/api/items?limit=500');
    const json = await res.json();
    return json; // Return the data instead of setting state directly, separation of concerns!!
  }, []);

  return (
    <DataContext.Provider value={{ items, setItems, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
