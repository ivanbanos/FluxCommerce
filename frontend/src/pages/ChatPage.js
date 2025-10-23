import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ChatPage.css';

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      // Send message to backend
      const response = await fetch('api/Chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          userId: 'user123',
          storeId: storeId || ''
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      console.log('🔍 Frontend DEBUG: Raw response from backend:', data);
      
      // Parse the structured response from backend
      let aiResponse;
      try {
        aiResponse = JSON.parse(data.response);
        console.log('🔍 Frontend DEBUG: Parsed AI Response:', aiResponse);
      } catch {
        // If not JSON, treat as regular message
        aiResponse = { Action: 'message', Message: data.response };
      }

      await handleAIResponse(aiResponse);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Lo siento, tengo problemas para conectarme. Por favor, inténtalo de nuevo.',
        sender: 'assistant',
        timestamp: new Date()
      };
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
          result += `🛍️ **${product.Name}**\n`;
          result += `   💰 Precio: $${product.Price.toFixed(2)}\n`;

          if (product.Description) {
              const description = product.Description.length > 80
                  ? product.Description.substring(0, 80) + "..."
                  : product.Description;
              result += `   📝 ${description}\n`;
          }

          if (product.Category) {
              result += `   📂 Categoría: ${product.Category}\n`;
          }

          result += `   🆔 ID: ${product.Id}\n\n`;
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