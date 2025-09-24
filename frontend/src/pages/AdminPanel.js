import React from 'react';
import { useNavigate, NavLink, Routes, Route } from 'react-router-dom';
import MerchantArticles from './MerchantArticles';
import MerchantOrders from './MerchantOrders';
import MerchantOrderDetail from './MerchantOrderDetail';

function AdminPanel() {
  const navigate = useNavigate();
  const name = localStorage.getItem('merchantName');
  const email = localStorage.getItem('merchantEmail');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('merchantName');
    localStorage.removeItem('merchantEmail');
    navigate('/login');
  };

  if (!localStorage.getItem('token')) {
    navigate('/login');
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: '#f5f5f5', padding: 24, borderRight: '1px solid #ddd' }}>
        <h3 style={{ marginTop: 0 }}>Mi tienda</h3>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontWeight: 'bold' }}>{name}</div>
          <div style={{ fontSize: 13, color: '#888' }}>{email}</div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <NavLink to="/admin/articles" style={({ isActive }) => ({ color: isActive ? '#1976d2' : '#333', textDecoration: 'none', fontWeight: isActive ? 'bold' : 'normal' })}>Artículos</NavLink>
          <NavLink to="/admin/orders" style={({ isActive }) => ({ color: isActive ? '#1976d2' : '#333', textDecoration: 'none', fontWeight: isActive ? 'bold' : 'normal' })}>Órdenes</NavLink>
        </nav>
        <button onClick={handleLogout} style={{ marginTop: 32, padding: 10, background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, width: '100%' }}>Cerrar sesión</button>
      </aside>
      <main style={{ flex: 1, background: '#fff', minHeight: '100vh' }}>
        <Routes>
          <Route path="articles" element={<MerchantArticles />} />
          <Route path="orders" element={<MerchantOrders />} />
          <Route path="orders/:orderId" element={<MerchantOrderDetail />} />
          <Route path="" element={
            <div style={{ padding: 24 }}>
              <h2>Panel de administración</h2>
              <p>Bienvenido, <b>{name}</b> ({email})</p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default AdminPanel;
