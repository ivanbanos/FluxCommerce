import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(120deg, #1976d2 0%, #fff 100%)' }}>
      <h1 style={{ fontSize: 40, color: '#1976d2', marginBottom: 32 }}>Bienvenido a FluxCommerce</h1>
      <div style={{ display: 'flex', gap: 32 }}>
        <button onClick={() => navigate('/merchant/login')} style={{ padding: '18px 40px', fontSize: 20, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, boxShadow: '0 2px 8px #1976d2', cursor: 'pointer' }}>Login Tienda</button>
        <button onClick={() => navigate('/admin/login')} style={{ padding: '18px 40px', fontSize: 20, background: '#388e3c', color: '#fff', border: 'none', borderRadius: 8, boxShadow: '0 2px 8px #388e3c', cursor: 'pointer' }}>Login Administrador</button>
  <button onClick={() => navigate('/store')} style={{ padding: '18px 40px', fontSize: 20, background: '#fff', color: '#1976d2', border: '2px solid #1976d2', borderRadius: 8, boxShadow: '0 2px 8px #eee', cursor: 'pointer' }}>Comprar</button>
      </div>
    </div>
  );
}

export default LandingPage;
