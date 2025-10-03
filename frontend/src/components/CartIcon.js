import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartIcon() {
  const { cart } = useCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  return (
    <Link to="/cart" style={{ position: 'relative', display: 'inline-block', marginRight: 16, color: '#1976d2', padding: '8px', borderRadius: '6px', transition: 'all 0.2s ease' }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = 'rgba(25, 118, 210, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
        <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.16 14l.84-2h7.45c.75 0 1.41-.41 1.75-1.03l3.24-5.88A1 1 0 0 0 19.45 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12z" fill="#1976d2"/>
      </svg>
      {count > 0 && (
        <span style={{ position: 'absolute', top: 0, right: 0, background: '#d32f2f', color: '#fff', borderRadius: '50%', fontSize: 12, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>
      )}
    </Link>
  );
}
