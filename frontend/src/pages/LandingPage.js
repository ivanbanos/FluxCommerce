import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  const isLogged = Boolean(
    localStorage.getItem('customerToken') || localStorage.getItem('token')
  );

  return (
    <div className="landing-root">
      <div className="landing-inner">
        <h1 className="landing-title">Bienvenido a FluxCommerce</h1>
        <p className="landing-sub">Tu tienda y clientes en un solo lugar — rápido, simple y moderno.</p>

        <div className="cta-group">
          {isLogged ? (
            <button className={`cta-btn cta-outline`} onClick={() => navigate('/store')}>
              Comprar
            </button>
          ) : (
            <>
              <button className={`cta-btn cta-outline`} onClick={() => navigate('/customer/register')}>
                Registro
              </button>
              <button className={`cta-btn cta-primary`} onClick={() => navigate('/customer/login')}>
                Login
              </button>
              <button className={`cta-btn cta-outline`} onClick={() => navigate('/store')}>
                Comprar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
