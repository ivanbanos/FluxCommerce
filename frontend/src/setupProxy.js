const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5265',
      changeOrigin: true,
    })
  );
  // Proxy SignalR hub requests (including WebSocket negotiate) to backend
  app.use(
    '/hubs',
    createProxyMiddleware({
      target: 'http://localhost:5265',
      changeOrigin: true,
      ws: true,
      logLevel: 'debug'
    })
  );
};
