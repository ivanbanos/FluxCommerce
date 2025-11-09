import React, { useEffect, useState } from 'react';
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

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-left">
          <Link to={role === 'seller' ? '/merchant' : '/'} className="brand">FluxCommerce</Link>
        </div>
        <div className="header-right">
          <label className="role-label" htmlFor="role-select">
            <select id="role-select" className="role-select" value={role} onChange={onRoleChange} aria-label="Seleccionar rol">
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </label>
          <CartIcon />
          <ChatIcon />
        </div>
      </div>
    </header>
  );
}
