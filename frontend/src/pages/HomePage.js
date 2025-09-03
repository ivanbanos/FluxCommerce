import React from 'react';

function HomePage() {
  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Bienvenido a Flux Commerce</h2>
      <p>Plataforma para crear tu tienda en línea.</p>
      <a href="/register" style={{ display: 'block', marginTop: 24, color: '#1976d2', textDecoration: 'underline' }}>Ir al registro</a>
    </div>
  );
}

export default HomePage;
