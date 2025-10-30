
import React, { useEffect, useState } from 'react';
import { getActiveStoreId } from '../utils/store';
import { useNavigate } from 'react-router-dom';

function MerchantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      const storeId = getActiveStoreId();
      const token = localStorage.getItem('token');
      if (!storeId) {
        setError('Seleccione una tienda primero');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/order/store/${storeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else {
          setError('No se pudieron cargar las órdenes');
        }
      } catch {
        setError('Error de red');
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Órdenes recibidas</h2>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && orders.length === 0 && <p>No hay órdenes.</p>}
      {!loading && !error && orders.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Fecha</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Comprador</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Total</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Estado</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Productos</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id || order._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/orders/${order.id || order._id}`)}>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{new Date(order.createdAt).toLocaleString()}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{order.buyerName}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{order.buyerEmail}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>${order.total.toFixed(2)}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{order.status}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {order.products.map((p, idx) => (
                      <li key={idx}>{p.name} x{p.qty}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MerchantOrders;
