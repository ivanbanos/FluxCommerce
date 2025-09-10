
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function PaymentSuccess() {
  const location = useLocation();
  useEffect(() => {
    // Si viene orderId en el state, marcar como pagado
    if (location.state?.orderId) {
      fetch(`/api/order/${location.state.orderId}/pay`, { method: 'POST' });
    }
  }, [location.state]);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 48, textAlign: 'center' }}>
      <h2 style={{ color: '#2a2', fontSize: 32, marginBottom: 24 }}>¡Pago aprobado!</h2>
      <p style={{ fontSize: 18, marginBottom: 32 }}>
        Tu transacción fue exitosa. Pronto recibirás la confirmación de tu pedido por email.
      </p>
      <Link to="/" style={{ color: '#1976d2', fontWeight: 'bold', fontSize: 18 }}>Volver a la tienda</Link>
    </div>
  );
}
