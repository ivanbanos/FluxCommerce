import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function ChatIcon() {
  const location = useLocation();
  
  // Determine chat route based on current page
  const getChatRoute = () => {
    const storeMatch = location.pathname.match(/\/store\/(.+)/);
    return storeMatch ? `/store/${storeMatch[1]}/chat` : '/chat';
  };

  // Don't show on admin pages or chat page itself
  const shouldShow = !location.pathname.startsWith('/admin') && 
                     !location.pathname.startsWith('/superadmin') &&
                     location.pathname !== '/admin-login' &&
                     !location.pathname.includes('/chat');

  if (!shouldShow) return null;

  return (
    <Link 
      to={getChatRoute()} 
      style={{ 
        position: 'relative', 
        display: 'inline-block', 
        marginRight: 16,
        textDecoration: 'none',
        color: '#1976d2',
        padding: '8px',
        borderRadius: '6px',
        transition: 'all 0.2s ease'
      }}
      title="Chat with Assistant"
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = 'rgba(25, 118, 210, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
        <path 
          d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" 
          fill="currentColor"
        />
      </svg>
      <span style={{
        position: 'absolute',
        top: 6,
        right: 6,
        background: '#4caf50',
        width: 8,
        height: 8,
        borderRadius: '50%'
      }} />
    </Link>
  );
}