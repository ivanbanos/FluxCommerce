import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SelectStore() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStores() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/store/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStores(data);
        } else {
          setError('No se pudieron cargar las tiendas');
        }
      } catch {
        setError('Error de red');
      }
      setLoading(false);
    }
    fetchStores();
  }, []);

  const handleSelect = (store) => {
    localStorage.setItem('storeId', store.id || store._id);
    localStorage.setItem('storeName', store.name);
    navigate('/admin');
  };

  if (loading) return <div>Cargando tiendas...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 32 }}>
      <h2>Selecciona tu tienda</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {stores.map(store => (
          <li key={store.id || store._id} style={{ marginBottom: 16 }}>
            <button onClick={() => handleSelect(store)} style={{ padding: 16, width: '100%', fontSize: 18, borderRadius: 8, border: '1px solid #1976d2', background: '#fff', cursor: 'pointer' }}>
              {store.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
