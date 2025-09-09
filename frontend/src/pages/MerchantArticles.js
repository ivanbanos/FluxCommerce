import React, { useState, useEffect } from 'react';
import ProductForm from '../components/ProductForm';

function MerchantArticles() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Cargar productos al montar
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/merchant/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          setError('No se pudieron cargar los productos');
        }
      } catch {
        setError('Error de red');
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleSave = async (form) => {
    setMessage('');
    setError('');
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('stock', form.stock);
    formData.append('coverIndex', form.coverIndex);
    form.images.forEach((img, idx) => {
      formData.append('images', img);
    });
    try {
      const res = await fetch('/api/merchant/product', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        setMessage('Producto guardado correctamente');
        // Recargar productos
        const res2 = await fetch('/api/merchant/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res2.ok) {
          const data = await res2.json();
          setProducts(data);
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Error al guardar producto');
      }
    } catch {
      setError('Error de red');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Agregar producto</h2>
      <ProductForm onSave={handleSave} />
      {message && <p style={{ color: 'green', marginTop: 16 }}>{message}</p>}
      {error && <p style={{ color: 'red', marginTop: 16 }}>{error}</p>}
      <h3 style={{ marginTop: 40 }}>Mis productos</h3>
      {loading ? <p>Cargando productos...</p> : null}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 16 }}>
        {products.map(prod => (
          <div key={prod.id} style={{ border: '1px solid #eee', borderRadius: 8, width: 220, padding: 12, background: '#fafbfc' }}>
            {prod.images && prod.images.length > 0 && (
              <img src={prod.images[prod.coverIndex] || prod.images[0]} alt={prod.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }} />
            )}
            <div style={{ fontWeight: 'bold', fontSize: 16 }}>{prod.name}</div>
            <div style={{ color: '#888', fontSize: 13, margin: '4px 0 8px 0' }}>{prod.description}</div>
            <div style={{ fontWeight: 'bold', color: '#1976d2' }}>${prod.price}</div>
            <div style={{ fontSize: 13 }}>Stock: {prod.stock}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MerchantArticles;
