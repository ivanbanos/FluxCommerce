import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import './ChatPanel.css';

export default function ChatPanel(){
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: '¡Hola! Soy tu asistente de compras. Pulsa aquí para empezar a chatear.', sender: 'assistant', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const panelRef = useRef(null);
  const [chatWidth, setChatWidth] = useState(360);
  const handleWidth = 48;
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const lastWidth = useRef(chatWidth);
  const HIDE_THRESHOLD = 80; // px - if resized smaller than this, hide panel
  const MIN_OPEN_WIDTH = 240; // minimal width to restore when opening (user-requested larger minimum)
  const lastGoodWidth = useRef(Math.max(chatWidth, MIN_OPEN_WIDTH));

  // headerHeight not needed when chat is part of layout

  useEffect(()=>{
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // no mobile-specific behavior here (mobile handled separately later)
  // track open state in a ref for imperative toggles
  const openRef = useRef(open);
  useEffect(() => { openRef.current = open; }, [open]);

  // Imperative open/close/toggle helpers to ensure width is set before opening
  const openPanel = useCallback(() => {
    const restoreCandidate = lastGoodWidth.current >= MIN_OPEN_WIDTH ? lastGoodWidth.current : MIN_OPEN_WIDTH;
    const restore = Math.max(restoreCandidate, MIN_OPEN_WIDTH);
    setChatWidth(restore);
    // ensure the CSS variable updates before flipping the open class so the expand animates correctly
    console.debug('[ChatPanel] openPanel restoring width', restore);
    requestAnimationFrame(() => {
      setOpen(true);
      // focus the input after open animation begins
      requestAnimationFrame(() => {
        if (inputRef.current) inputRef.current.focus();
      });
    });
  }, []);
  const closePanel = useCallback(() => {
    console.debug('[ChatPanel] closePanel');
    // remember a sensible width for next open if panel is not tiny
    const current = lastWidth.current || chatWidth;
    if (current >= MIN_OPEN_WIDTH) lastGoodWidth.current = current;
    setOpen(false);
  }, [chatWidth]);
  const togglePanel = useCallback(() => {
    console.debug('[ChatPanel] togglePanel, currently open=', openRef.current);
    if (openRef.current) closePanel(); else openPanel();
  }, [closePanel, openPanel]);

  // Listen for global open/toggle events (dispatched by header/chat icon)
  useEffect(() => {
    window.addEventListener('openChatPanel', openPanel);
    window.addEventListener('toggleChatPanel', togglePanel);
    return () => {
      window.removeEventListener('openChatPanel', openPanel);
      window.removeEventListener('toggleChatPanel', togglePanel);
    };
  }, [openPanel, togglePanel]);

  const { addToCart, cart } = useCart();

  const formatProductSearchResults = (products, query) => {
    if (!products || products.length === 0) {
      return `No encontré productos que coincidan con '${query}'.`;
    }
    let result = `Encontré ${products.length} productos relacionados con '${query}':\n\n`;
    products.forEach(product => {
      result += `• ${product.Name || product.name || ''} — ${product.Price ?? product.price}\n`;
    });
    return result;
  };

  const formatCartContents = (cartItems) => {
    if (!cartItems || cartItems.length === 0) return 'Tu carrito está vacío.';
    let total = 0;
    let out = 'Tu carrito:\n\n';
    cartItems.forEach(i => { const subtotal = (i.price||0) * (i.qty||1); total += subtotal; out += `• ${i.name} x${i.qty || 1} — ${subtotal}\n`; });
    out += `\nTotal: ${total}`;
    return out;
  };

  const handleAIResponse = async (aiResponse) => {
    let messageText = aiResponse.Message || 'Lo siento, no pude procesar esa solicitud.';
    switch (aiResponse.Action) {
      case 'search_results':
        messageText = formatProductSearchResults(aiResponse.Products || [], aiResponse.Query || '');
        break;
      case 'add_to_cart':
        if (aiResponse.ProductId) {
          try {
            const productResponse = await fetch(`/api/Product/${aiResponse.ProductId}`);
            if (productResponse.ok) {
              const product = await productResponse.json();
              addToCart({ id: product.Id || product.id || product._id, name: product.Name || product.name, price: product.Price || product.price, imageUrl: (product.Images && product.Images[0]) || product.Cover || product.cover, qty: aiResponse.Quantity || 1 });
              messageText = `¡Excelente! He agregado "${product.Name || product.name}" a tu carrito.`;
            } else {
              messageText = 'Lo siento, no pude encontrar ese producto.';
            }
          } catch (err) {
            messageText = 'Ocurrió un error al agregar el producto al carrito.';
          }
        }
        break;
      case 'view_cart':
        messageText = formatCartContents(cart);
        break;
      case 'message':
      default:
        messageText = aiResponse.Message || messageText;
        break;
    }
    setMessages(prev => [...prev, { id: Date.now()+1, text: messageText, sender: 'assistant', timestamp: new Date() }]);
  };

  const send = async (e) =>{
    e?.preventDefault?.();
    if(!input.trim()) return;
    const userMsg = { id: Date.now(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev=>[...prev, userMsg]);
    setInput('');
    setLoading(true);

    try{
      const storeId = localStorage.getItem('storeId') || '';
      const res = await fetch('/api/Chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text, userId: 'user123', storeId })
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      // attempt to parse structured response (like ChatPage)
      let aiResponse;
      try {
        aiResponse = JSON.parse(data.response);
      } catch {
        aiResponse = { Action: 'message', Message: data.response };
      }
      await handleAIResponse(aiResponse);
    }catch(err){
      setMessages(prev => [...prev, { id: Date.now()+1, text: 'Error al enviar el mensaje. Intenta de nuevo.', sender: 'assistant', timestamp: new Date() }]);
      console.error('ChatPanel send error', err);
    }finally{
      setLoading(false);
    }
  };
  // resizing handlers: attach listeners on start so they work across clicks/touches (horizontal only)
  const startResize = (clientXInit) => {
    isResizing.current = true;
    startX.current = clientXInit;
    startWidth.current = chatWidth;
    console.debug('[ChatPanel] startResize', { startX: clientXInit, startWidth: startWidth.current });

    const onMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX);
      if (clientX == null) return;
      const delta = startX.current - clientX;
      let next = Math.max(handleWidth, startWidth.current + delta);
      const max = Math.round(window.innerWidth * 0.8);
      if (next > max) next = max;
      setChatWidth(next);
      lastWidth.current = next;
      if (next >= HIDE_THRESHOLD) lastGoodWidth.current = next;
    };

    const onUp = () => {
      isResizing.current = false;
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      // if user dragged the panel nearly closed, hide it and restore a sensible width for next open
        if (lastWidth.current <= HIDE_THRESHOLD) {
          const restoreCandidate = lastGoodWidth.current >= MIN_OPEN_WIDTH ? lastGoodWidth.current : MIN_OPEN_WIDTH;
          const restore = Math.max(restoreCandidate, MIN_OPEN_WIDTH);
          setChatWidth(restore);
          setOpen(false);
        }
      console.debug('[ChatPanel] endResize, lastWidth=', lastWidth.current);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    document.body.style.userSelect = 'none';
  };

  // keep lastWidth and lastGoodWidth in sync with programmatic width changes
  useEffect(() => {
    lastWidth.current = chatWidth;
    if (chatWidth >= MIN_OPEN_WIDTH) lastGoodWidth.current = chatWidth;
  }, [chatWidth]);

  // input ref to focus when opening
  const inputRef = useRef(null);

    return (
    <div
      ref={panelRef}
      className={"chat-panel " + (open ? 'open' : 'closed')}
      style={{ '--chat-width': `${chatWidth}px`, '--handle-width': `${handleWidth}px` }}
    >
      {/* resizer - draggable area on the left edge (only used when open) */}
        {open && (
          <div
            className="chat-resizer"
            onMouseDown={(e) => { e.preventDefault(); startResize(e.clientX); }}
            onTouchStart={(e) => { e.preventDefault(); startResize(e.touches[0].clientX); }}
            role="separator"
            aria-orientation='vertical'
          />
        )}

      <div className="chat-body" role="dialog" aria-hidden={!open}>
        <div className="chat-header">
          <div>Asistente</div>
          <button
            className="close-btn"
            type="button"
            title="Cerrar chat"
            aria-label="Cerrar chat"
            onClick={closePanel}
          >
            ✕
          </button>
        </div>
        <div className="chat-messages">
          {messages.map(m=> (
            <div key={m.id} className={`cp-message ${m.sender==='user' ? 'cp-user' : 'cp-assistant'}`}>
              <div className="cp-text" style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
              <div className="cp-time">{new Date(m.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form className="chat-input-row" onSubmit={send}>
          <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} placeholder="Escribe un mensaje..." disabled={loading} />
          <button type="submit" disabled={loading || !input.trim()}>{loading ? '⏳' : 'Enviar'}</button>
        </form>
      </div>
    </div>
  );
}
