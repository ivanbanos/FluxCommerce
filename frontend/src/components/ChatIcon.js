import React from 'react';
import { useLocation } from 'react-router-dom';

export default function ChatIcon() {
  const location = useLocation();
  
  // Don't show on admin pages or chat page itself
  const shouldShow = !location.pathname.startsWith('/admin') && 
                     !location.pathname.startsWith('/superadmin') &&
                     location.pathname !== '/admin-login' &&
                     !location.pathname.includes('/chat');

  if (!shouldShow) return null;

  const openPanel = (e) => {
    e?.preventDefault?.();
    // toggle the chat panel (header button controls open/close)
    window.dispatchEvent(new CustomEvent('toggleChatPanel'));
  };

  return (
    <button
      onClick={openPanel}
      style={{
        position: 'relative',
        display: 'inline-block',
        textDecoration: 'none',
        color: 'inherit',
        padding: '6px',
        borderRadius: '6px',
        transition: 'all 0.2s ease',
        background: 'transparent',
        border: 'none'
      }}
      title="Chat with Assistant"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
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
    </button>
  );
}