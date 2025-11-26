import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './StoreList.css';

export default function StoreList() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStores() {
      setLoading(true);
      try {
        const res = await fetch('/api/store/all');
        if (!res.ok) {
          console.error('Failed to fetch stores', res.status);
          setStores([]);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setStores(data || []);
      } catch (err) {
        console.error('Error fetching stores', err);
        setStores([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 20 }}>
      <h2 style={{ margin: '8px 0 12px' }}>Tiendas</h2>
      <div className="store-grid">
        {stores.map(store => {
          const sid = store.id || store.Id || store._id;
          return (
            <Link
              key={sid || Math.random()}
              to={`/store/${sid}`}
              onClick={() => sid && localStorage.setItem('storeId', sid)}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="store-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="store-title">{store.name || store.Name}</div>
                  <div className="store-badge">{store.category || store.Category || 'Tienda'}</div>
                </div>
                <div className="store-sub">{store.address || store.Address || ''}</div>
                <div className="store-meta">
                  <div className="store-sub">{store.email || store.Email || ''}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{store.state || store.State}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
