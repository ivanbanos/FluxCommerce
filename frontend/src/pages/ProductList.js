import React, { useEffect, useState } from 'react';
import { getImageUrl } from '../utils/imageUrl';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductList() {
  const params = useParams();
  const { storeId: paramStoreId } = params || {};
  const storeId = paramStoreId || localStorage.getItem('storeId');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      if (!storeId) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/product/list/${storeId}`);
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, [storeId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      {products.map(product => (
        <div key={product.id} style={{ border: '1px solid #eee', borderRadius: 8, width: 220, padding: 16, boxShadow: '0 2px 8px #eee' }}>
          <img src={getImageUrl(product.cover)} alt={product.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 4 }} />
          <h3 style={{ margin: '12px 0 4px 0', fontSize: 18 }}>{product.name}</h3>
          <div style={{ fontWeight: 'bold', color: '#2a2' }}>${product.price}</div>
          <button
            style={{ marginTop: 12, width: '100%', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: 8, cursor: 'pointer' }}
            onClick={() => addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              cover: product.cover,
              stock: product.stock || 1,
              storeId: storeId
            })}
          >
            Agregar
          </button>
        </div>
      ))}
    </div>
  );
}
