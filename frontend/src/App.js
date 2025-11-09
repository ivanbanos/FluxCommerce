import React from 'react';
import { CartProvider } from './context/CartContext';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';

import StoreList from './pages/StoreList';
import SelectStore from './pages/SelectStore';
import LandingPage from './pages/LandingPage';
import MerchantSetupWizard from './pages/MerchantSetupWizard';
import MerchantLanding from './pages/MerchantLanding';
import RegisterMerchant from './pages/Register';
import TrackOrders from './pages/TrackOrders';
import RegisterPage from './pages/RegisterPage';
import RegisterCustomer from './pages/RegisterCustomer';
import LoginCustomer from './pages/LoginCustomer';
import CustomerMenu from './pages/CustomerMenu';
import CustomerOrders from './pages/CustomerOrders';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/AdminPanel';
 
import ProtectedRoute from './components/ProtectedRoute';
import AdminLoginPage from './pages/AdminLoginPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
 
import CartPage from './pages/CartPage';

import PaymentSuccess from './pages/PaymentSuccess';
import ShippingPage from './pages/ShippingPage';

// Header component is provided by ./components/Header

function Shell(){
  const location = useLocation();
  return (
    <>
      <Header />
      <div className="app-shell" style={{ display: 'flex', alignItems: 'stretch' }}>
        <main className="app-main" style={{ flex: 1 }}>
          <div className="route-fade" key={location.pathname}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/customer/register" element={<RegisterCustomer />} />
              <Route path="/customer/login" element={<LoginCustomer />} />
              <Route path="/customer/menu" element={<CustomerMenu />} />
              <Route path="/customer/orders" element={<CustomerOrders />} />
              <Route path="/merchant/login" element={<LoginPage />} />
              <Route path="/merchant" element={<MerchantLanding />} />
              <Route path="/merchant/register" element={<RegisterMerchant />} />
              <Route path="/select-store" element={<SelectStore />} />
              <Route path="/admin/*" element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<AdminLoginPage />} />
              <Route path="/superadmin" element={
                <ProtectedAdminRoute>
                  <SuperAdminDashboard />
                </ProtectedAdminRoute>
              } />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/shipping" element={<ShippingPage />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/store" element={<StoreList />} />
              <Route path="/store/:storeId" element={<ProductList />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/track-orders" element={<TrackOrders />} />
              <Route path="/merchant-setup" element={<MerchantSetupWizard />} />
            </Routes>
          </div>
        </main>
        <ChatPanel />
      </div>
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </CartProvider>
  );
}
export default App;
