import React from 'react';
import { Link } from 'react-router-dom';

export default function HomeIcon() {
  return (
    <Link 
      to="/" 
      style={{ 
        display: 'inline-block', 
        marginLeft: 16,
        textDecoration: 'none',
        color: '#1976d2',
        padding: '8px',
        borderRadius: '6px',
        transition: 'all 0.2s ease'
      }}
      title="Home"
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = 'rgba(25, 118, 210, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
        <path 
          d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" 
          fill="currentColor"
        />
      </svg>
    </Link>
  );
}