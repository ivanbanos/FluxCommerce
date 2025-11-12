import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ChatPage.css';
import * as signalR from '@microsoft/signalr';

const ChatPage = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart } = useCart();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente de compras de FluxCommerce. ¿En qué puedo ayudarte a encontrar productos hoy?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [connection, setConnection] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize SignalR connection and listeners
  useEffect(() => {
    const userIdStorage = localStorage.getItem('userId') || `user_${Date.now()}`;
    if (!localStorage.getItem('userId')) localStorage.setItem('userId', userIdStorage);

    const conn = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5265/hubs/chat')
      .withAutomaticReconnect()
      .build();

    conn.start()
      .then(() => {
        console.log('SignalR connected');
        // Join the group for this user so server can push messages
        conn.invoke('JoinGroup', userIdStorage).catch(err => console.error(err));
      })
      .catch(err => console.error('SignalR connection error:', err));

    // Incoming simple assistant messages
    conn.on('ReceiveMessage', (payload) => {
      try {
        const text = payload?.text || payload;
        const timestamp = payload?.timestamp ? new Date(payload.timestamp) : new Date();
        setMessages(prev => [...prev, { id: Date.now(), text, sender: 'assistant', timestamp }]);
      } catch (e) { console.error(e); }
    });

    // Incoming structured actions (search_results, add_to_cart, view_cart, etc.)
    conn.on('ReceiveAction', (payload) => {
      try {
        console.log('SignalR ReceiveAction', payload);
        if (!payload) return;
        const action = (payload.Action || payload.action || '').toLowerCase();
        switch (action) {
          case 'search_results':
            // Legacy search results handling
            const products = payload.products || payload.Products || [];
            const query = payload.query || payload.Query || '';
            const msg = formatProductSearchResults(products, query);
            setMessages(prev => [...prev, { id: Date.now(), text: msg, sender: 'assistant', timestamp: new Date() }]);
            break;
            
          case 'single_recommendation':
            // Single product recommendation - already handled by ReceiveMessage
            // This is for any additional frontend-specific logic
            console.log('Single product recommendation received:', payload.product);
            break;
            
          case 'multiple_options':
            // Multiple products - already handled by ReceiveMessage
            // This could be used for special UI components in the future
            console.log('Multiple options received:', payload.products?.length || 0, 'products');
            break;
            
          case 'too_many_results':
            // Too many results - already handled by ReceiveMessage
            console.log('Too many results, showing top:', payload.products?.length || 0, 'of', payload.totalCount);
            break;
            
          case 'search_completed':
            // Search process completed - for analytics or UI updates
            console.log('Search completed with', payload.ProductCount, 'products found');
            break;
            
          case 'add_to_cart':
            if (payload.ProductId) {
              // Try to fetch product details and add to cart
              fetch(`/api/product/${payload.ProductId}`)
                .then(res => res.ok ? res.json() : null)
                .then(product => {
                  if (product) {
                    addToCart({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, qty: payload.Quantity || 1 });
                    setMessages(prev => [...prev, { id: Date.now(), text: payload.Message || `Agregado ${product.name} al carrito.`, sender: 'assistant', timestamp: new Date() }]);
                  } else {
                    setMessages(prev => [...prev, { id: Date.now(), text: 'No encontré el producto para agregar.', sender: 'assistant', timestamp: new Date() }]);
                  }
                });
            }
            break;
          case 'view_cart':
            setMessages(prev => [...prev, { id: Date.now(), text: payload.Message || formatCartContents(cart), sender: 'assistant', timestamp: new Date() }]);
            break;
          case 'message':
          default:
            setMessages(prev => [...prev, { id: Date.now(), text: payload.Message || payload.message || JSON.stringify(payload), sender: 'assistant', timestamp: new Date() }]);
            break;
        }
      } catch (e) { console.error(e); }
    });

    setConnection(conn);

    return () => {
      if (conn) {
        conn.stop().catch(() => {});
      }
    };
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const uid = localStorage.getItem('userId') || 'user123';
      if (connection) {
        // Invoke hub method to process message; server will push intermediate and final messages via SignalR
        await connection.invoke('SendMessage', uid, inputMessage, storeId || '');
      } else {
        // Fallback to HTTP POST if SignalR is not available
        const response = await fetch('api/Chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputMessage, userId: uid, storeId: storeId || '' }),
        });

        if (!response.ok) throw new Error('Failed to send message');
        const data = await response.json();
        let aiResponse;
        try { aiResponse = JSON.parse(data.response); } catch { aiResponse = { Action: 'message', Message: data.response }; }
        await handleAIResponse(aiResponse);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { id: Date.now() + 1, text: 'Lo siento, tengo problemas para conectarme. Por favor, inténtalo de nuevo.', sender: 'assistant', timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIResponse = async (aiResponse) => {
      let messageText = aiResponse.Message || 'Lo siento, no pude procesar esa solicitud.';

      console.log('🔍 Frontend DEBUG: Received AI Response:', aiResponse);

      switch (aiResponse.Action) {
        case 'search_results':
          // Format products in the frontend
          messageText = formatProductSearchResults(aiResponse.Products || [], aiResponse.Query || '');
          console.log('📊 Frontend DEBUG: Displaying formatted search results');
          break;

        case 'add_to_cart':
          if (aiResponse.ProductId) {
            try {
              const productResponse = await fetch(`api/Product/${aiResponse.ProductId}`);
              if (productResponse.ok) {
                const product = await productResponse.json();
                
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrl,
                  qty: aiResponse.Quantity || 1
                });

                messageText = `¡Excelente! He agregado "${product.name}" a tu carrito. 🛒\n\n¿Quieres continuar comprando o ver tu carrito completo?`;
              } else {
                messageText = 'Lo siento, no pude encontrar ese producto. ¿Podrías verificar el ID?';
              }
            } catch (error) {
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

      const assistantMessage = {
        id: Date.now() + 1,
        text: messageText,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
  };

  // Helper function to format product search results
  const formatProductSearchResults = (products, query) => {
      if (!products || products.length === 0) {
          return `No encontré productos que coincidan con '${query}'. ¿Podrías intentar con otros términos de búsqueda?`;
      }

      let result = `Encontré ${products.length} productos relacionados con '${query}':\n\n`;

      products.forEach(product => {
          result += `🛍️ **${product.name || product.Name}**\n`;
          result += `   💰 Precio: $${(product.price || product.Price).toFixed(2)}\n`;

          const description = product.description || product.Description;
          if (description) {
              const desc = description.length > 80
                  ? description.substring(0, 80) + "..."
                  : description;
              result += `   📝 ${desc}\n`;
          }

          const category = product.category || product.Category;
          if (category) {
              result += `   📂 Categoría: ${category}\n`;
          }

          result += `   🆔 ID: ${product.id || product.Id}\n\n`;
      });

      result += "¿Te interesa alguno de estos productos? Solo dime el ID del producto si quieres agregarlo a tu carrito.";
      return result;
  };

  // Helper function to format cart contents
  const formatCartContents = (cart) => {
      if (cart.length === 0) {
          return "Tu carrito está vacío. 🛒\n\n¿Te gustaría buscar algunos productos?";
      }

      let result = "🛒 **Tu Carrito de Compras:**\n\n";
      let total = 0;

      cart.forEach(item => {
          const itemTotal = item.price * item.qty;
          total += itemTotal;
          result += `• **${item.name}**\n`;
          result += `  Cantidad: ${item.qty} | Precio: $${item.price.toFixed(2)} | Subtotal: $${itemTotal.toFixed(2)}\n\n`;
      });

      result += `💰 **Total: $${total.toFixed(2)}**\n\n`;
      result += "¿Te gustaría proceder al checkout o continuar comprando?";
      return result;
  };

  return (
    <div className="chat-page">
      <div className="chat-page-container">
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-content">
                <p style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant-message">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={sendMessage}>
          <div className="input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Pregunta sobre productos, revisa tu carrito..."
              disabled={isLoading}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="send-button"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;