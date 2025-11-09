import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  const actions = [
    { to: '/merchant/login', label: 'Login Tienda', variant: 'primary' },
    { to: '/admin/login', label: 'Login Administrador', variant: 'accent' },
    { to: '/customer/register', label: 'Registro Cliente', variant: 'outline' },
    { to: '/customer/menu', label: 'Menú Cliente', variant: 'ghost' },
    { to: '/store', label: 'Comprar', variant: 'outline' }
  ];

  return (
    <div className="landing-root">
      <div className="landing-inner">
        <h1 className="landing-title">Bienvenido a FluxCommerce</h1>
        <p className="landing-sub">Tu tienda y clientes en un solo lugar — rápido, simple y moderno.</p>

        <div className="cta-group">
          {actions.map((a) => (
            <button
              key={a.label}
              className={`cta-btn cta-${a.variant}`}
              onClick={() => navigate(a.to)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
