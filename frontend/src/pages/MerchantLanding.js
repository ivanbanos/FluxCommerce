import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function MerchantLanding(){
  const navigate = useNavigate();

  const actions = [
    { to: '/merchant/login', label: 'Login', variant: 'primary' },
    { to: '/merchant/register', label: 'Register', variant: 'outline' }
  ];

  return (
    <div className="landing-root">
      <div className="landing-inner">
        <h1 className="landing-title">FluxCommerce</h1>
        <p className="landing-sub">Panel de comerciantes — gestiona tu tienda, productos y pedidos.</p>

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
