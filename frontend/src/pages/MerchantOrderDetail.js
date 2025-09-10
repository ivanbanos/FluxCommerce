import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMerchantIdFromToken } from '../utils/auth';

function MerchantOrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!orderId) {
        setError('ID de orden no especificado');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          setError('No se pudo cargar la orden');
        }
      } catch {
        setError('Error de red');
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <div style={{ padding: 24 }}>Cargando...</div>;
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>;
  if (!order) return null;

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');

  const handleMarkAsShipped = async () => {
    setSending(true);
    setSendError('');
    setSendSuccess('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/order/${order.id || order._id}/ship`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setOrder({ ...order, status: 'enviado' });
        setSendSuccess('Orden marcada como enviada');
      } else {
        setSendError('No se pudo actualizar el estado');
      }
    } catch {
      setSendError('Error de red');
    }
    setSending(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 700 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>&larr; Volver</button>
      <h2>Detalle de la orden</h2>
      <div style={{ marginBottom: 24 }}>
        <b>Cliente:</b> {order.buyerName} <br />
        <b>Email:</b> {order.buyerEmail} <br />
        <b>Fecha:</b> {new Date(order.createdAt).toLocaleString()} <br />
        <b>Estado:</b> {order.status} <br />
        <b>Total pagado:</b> ${order.total?.toFixed(2)}
        {order.status !== 'enviado' && (
          <div style={{ marginTop: 16 }}>
            <button onClick={handleMarkAsShipped} disabled={sending} style={{ padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
              {sending ? 'Enviando...' : 'Marcar como enviado'}
            </button>
            {sendError && <span style={{ color: 'red', marginLeft: 12 }}>{sendError}</span>}
            {sendSuccess && <span style={{ color: 'green', marginLeft: 12 }}>{sendSuccess}</span>}
          </div>
        )}
      </div>
      <h3>Productos</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>Producto</th>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>Cantidad</th>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>Precio</th>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.products.map((p, idx) => (
            <tr key={idx}>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>{p.name}</td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>{p.qty}</td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>${p.price.toFixed(2)}</td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>${(p.price * p.qty).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MerchantOrderDetail;