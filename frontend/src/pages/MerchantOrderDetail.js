import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


function MerchantOrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Tracking number state
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingEdit, setTrackingEdit] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [trackingSuccess, setTrackingSuccess] = useState('');

  // Estado para marcar como enviado/recibido
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');

  const [receiving, setReceiving] = useState(false);
  const [receiveError, setReceiveError] = useState('');
  const [receiveSuccess, setReceiveSuccess] = useState('');

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

  useEffect(() => {
    if (order && order.trackingNumber) {
      setTrackingNumber(order.trackingNumber);
    }
  }, [order]);

  const handleTrackingSubmit = async (e) => {
    e.preventDefault();
    setTrackingLoading(true);
    setTrackingError('');
    setTrackingSuccess('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/order/${order.id || order._id}/tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ trackingNumber })
      });
      if (res.ok) {
        setOrder({ ...order, trackingNumber });
        setTrackingSuccess('Número de guía actualizado');
        setTrackingEdit(false);
      } else {
        setTrackingError('No se pudo actualizar el número de guía');
      }
    } catch {
      setTrackingError('Error de red');
    }
    setTrackingLoading(false);
  };

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

  const handleMarkAsReceived = async () => {
    setReceiving(true);
    setReceiveError('');
    setReceiveSuccess('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/order/${order.id || order._id}/receive`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setOrder({ ...order, status: 'recibido' });
        setReceiveSuccess('Orden marcada como recibida');
      } else {
        setReceiveError('No se pudo actualizar el estado');
      }
    } catch {
      setReceiveError('Error de red');
    }
    setReceiving(false);
  };

  if (loading) {
    return <div style={{ padding: 24 }}>Cargando...</div>;
  }
  if (error) {
    return <div style={{ padding: 24, color: 'red' }}>{error}</div>;
  }
  if (!order) {
    return <div style={{ padding: 24, color: 'red' }}>No se encontró la orden.</div>;
  }

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
        <br />
        {/* Número de guía: solo si la orden está enviada o recibida */}
        {(order.status === 'enviado' || order.status === 'recibido') && (
          <div style={{ marginTop: 16 }}>
            <b>Número de guía:</b>{' '}
            {order.trackingNumber && !trackingEdit ? (
              <>
                <span>{order.trackingNumber}</span>
                {order.status === 'enviado' && (
                  <button style={{ marginLeft: 12 }} onClick={() => setTrackingEdit(true)}>
                    Editar
                  </button>
                )}
              </>
            ) : order.status === 'enviado' ? (
              <form onSubmit={handleTrackingSubmit} style={{ display: 'inline' }}>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  placeholder="Número de guía"
                  style={{ marginRight: 8 }}
                  required
                />
                <button type="submit" disabled={trackingLoading}>
                  {trackingLoading ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => { setTrackingEdit(false); setTrackingError(''); setTrackingSuccess(''); }} style={{ marginLeft: 8 }}>
                  Cancelar
                </button>
              </form>
            ) : null}
            {trackingError && <span style={{ color: 'red', marginLeft: 12 }}>{trackingError}</span>}
            {trackingSuccess && <span style={{ color: 'green', marginLeft: 12 }}>{trackingSuccess}</span>}
          </div>
        )}
        {/* Botón para marcar como enviado si no está enviado ni recibido */}
        {order.status !== 'enviado' && order.status !== 'recibido' && (
          <div style={{ marginTop: 16 }}>
            <button onClick={handleMarkAsShipped} disabled={sending} style={{ padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
              {sending ? 'Enviando...' : 'Marcar como enviado'}
            </button>
            {sendError && <span style={{ color: 'red', marginLeft: 12 }}>{sendError}</span>}
            {sendSuccess && <span style={{ color: 'green', marginLeft: 12 }}>{sendSuccess}</span>}
          </div>
        )}
        {/* Botón para marcar como recibido si está enviado */}
        {order.status === 'enviado' && (
          <div style={{ marginTop: 16 }}>
            <button onClick={handleMarkAsReceived} disabled={receiving} style={{ padding: 10, background: '#388e3c', color: '#fff', border: 'none', borderRadius: 4 }}>
              {receiving ? 'Actualizando...' : 'Marcar como recibido'}
            </button>
            {receiveError && <span style={{ color: 'red', marginLeft: 12 }}>{receiveError}</span>}
            {receiveSuccess && <span style={{ color: 'green', marginLeft: 12 }}>{receiveSuccess}</span>}
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