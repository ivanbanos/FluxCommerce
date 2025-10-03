import React from 'react';
import { CartProvider } from './context/CartContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CartIcon from './components/CartIcon';
import HomeIcon from './components/HomeIcon';
import ChatIcon from './components/ChatIcon'; // NEW

import StoreList from './pages/StoreList';
import MerchantSetupWizard from './pages/MerchantSetupWizard';
import TrackOrders from './pages/TrackOrders';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/AdminPanel';
import MerchantOrderDetail from './pages/MerchantOrderDetail';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLoginPage from './pages/AdminLoginPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import MerchantArticles from './pages/MerchantArticles';
import MerchantOrders from './pages/MerchantOrders';
import CartPage from './pages/CartPage';
import ChatPage from './pages/ChatPage'; // NEW

import PaymentSuccess from './pages/PaymentSuccess';
import ShippingPage from './pages/ShippingPage';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div style={{ width: '100%', background: '#f5f5f5', padding: '12px 0', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{display: 'flex', alignItems: 'center', flex: 1}}>
            <HomeIcon />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ChatIcon />
            <CartIcon />
        </div>
        </div>
        <Routes>
          <Route path="/" element={<StoreList />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/superadmin" element={
            <ProtectedAdminRoute>
              <SuperAdminDashboard />
            </ProtectedAdminRoute>
          } />
  <Route path="/cart" element={<CartPage />} />
  <Route path="/shipping" element={<ShippingPage />} />
  <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/store/:merchantId" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/track-orders" element={<TrackOrders />} />
          <Route path="/merchant-setup" element={<MerchantSetupWizard />} />
          {/* NEW: Chat routes */}
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/store/:storeId/chat" element={<ChatPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
