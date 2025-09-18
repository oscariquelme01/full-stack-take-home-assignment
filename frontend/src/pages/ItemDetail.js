import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ItemDetail.css';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/api/items/' + id)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(setItem)
      .catch((err) => {
        console.error('Failed to fetch item:', err);
        navigate('/');
      });
  }, [id, navigate]);

  if (!item) return <p>Loading...</p>;

  return (
    <div className="item-detail-container">
      <h2>{item.name}</h2>
      <p><strong>Category:</strong> {item.category}</p>
      <p><strong>Price:</strong> ${item.price}</p>
      <Link to="/" className="back-button">Back to Items</Link>
    </div>
  );
}

export default ItemDetail;
