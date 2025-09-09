import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function StoreList() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStores() {
      setLoading(true);
      const res = await fetch('/api/merchant/all');
      const data = await res.json();
      setStores(data);
      setLoading(false);
    }
    fetchStores();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <h2>Tiendas</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {stores.map(store => (
          <Link key={store.id} to={`/store/${store.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #eee', borderRadius: 8, width: 220, padding: 16, boxShadow: '0 2px 8px #eee', textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: 20 }}>{store.name}</div>
              <div style={{ color: '#888', marginTop: 8 }}>{store.email}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
