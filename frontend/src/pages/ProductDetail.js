import React, { useEffect, useState } from 'react';
import { getImageUrl } from '../utils/imageUrl';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { addToCart } = useCart();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const res = await fetch(`/api/product/${id}`);
      const data = await res.json();
      setProduct(data);
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Producto no encontrado</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', gap: 32 }}>
        <div>
          <img src={getImageUrl(product.images?.[product.coverIndex])} alt={product.name} style={{ width: 320, height: 320, objectFit: 'cover', borderRadius: 8 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {product.images?.map((img, idx) => (
              <img key={idx} src={getImageUrl(img)} alt='' style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, border: idx === product.coverIndex ? '2px solid #1976d2' : '1px solid #ccc' }} />
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 28 }}>{product.name}</h2>
          <div style={{ fontWeight: 'bold', fontSize: 22, color: '#2a2', margin: '12px 0' }}>${product.price}</div>
          <div style={{ marginBottom: 16 }}>{product.description}</div>
          <div>Stock: {product.stock}</div>
          <button
            style={{ marginTop: 24, width: 200, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: 12, fontSize: 18, cursor: 'pointer' }}
            onClick={() => addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              cover: product.images?.[product.coverIndex] || '',
              stock: product.stock
            })}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
