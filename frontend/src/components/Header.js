import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChatIcon from './ChatIcon';
import CartIcon from './CartIcon';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem('userRole') || 'buyer');

  useEffect(() => {
    localStorage.setItem('userRole', role);
  }, [role]);

  const onRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    // Redirect according to the selected role
    if (newRole === 'buyer') {
      navigate('/');
    } else if (newRole === 'seller') {
      navigate('/merchant');
    }
  };

  // User menu state and refs
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    function onDocumentClick(e) {
      if (!menuOpen) return;
      if (menuRef.current && !menuRef.current.contains(e.target) && menuButtonRef.current && !menuButtonRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDocumentClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const openSettings = () => {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      navigate('/customer/login');
    } else {
      navigate('/customer/menu');
    }
    setMenuOpen(false);
  };


  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-left">
          <Link to={role === 'seller' ? '/merchant' : '/'} className="brand">FluxCommerce</Link>
        </div>
        <div className="header-right">
          <label className="role-label" htmlFor="role-select">
            <select id="role-select" className="role-select" value={role} onChange={onRoleChange} aria-label="Seleccionar rol">
              <option value="buyer">Customer</option>
              <option value="seller">Merchant</option>
            </select>
          </label>

          {/* SuperAdmin login button in the top bar */}
          <Link to="/login" className="admin-btn" aria-label="SuperAdmin login">SuperAdmin</Link>

          {/* User menu / account access */}
          <div className="user-menu">
            <button
              ref={menuButtonRef}
              className="user-menu-button"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(v => !v)}
              title="Cuenta"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="currentColor" />
                <path d="M4 20c0-3.314 2.686-6 6-6h4c3.314 0 6 2.686 6 6v1H4v-1z" fill="currentColor" />
              </svg>
            </button>

            {menuOpen && (
              <div className="user-dropdown" ref={menuRef} role="menu" aria-label="User menu">
                <button className="user-dropdown-item" onClick={openSettings} role="menuitem">Mi cuenta</button>
              </div>
            )}
          </div>

          <CartIcon />
          <ChatIcon />
        </div>
      </div>
    </header>
  );
}
