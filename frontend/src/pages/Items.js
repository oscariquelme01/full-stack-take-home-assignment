import React, { useEffect } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

function Items() {
  const { items, setItems, fetchItems } = useData();

  useEffect(() => {
    let active = true;

    // fetchItems now returns a promise that resolves with the data
    fetchItems()
      .then(fetchedItems => {
        // Check if the component is still mounted before setting state
        if (active) {
          setItems(fetchedItems);
        }
      })
      .catch(console.error);

    // Cleanup function to set the flag to false on unmount
    return () => {
      active = false;
    };
  }, [fetchItems, setItems]);

  if (!items.length) return <p>Loading...</p>;

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          <Link to={'/items/' + item.id}>{item.name}</Link>
        </li>
      ))}
    </ul>
  );
}

export default Items;
