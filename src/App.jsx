import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TenantProvider, useTenant } from './context/TenantContext';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { WebsiteContentProvider } from './context/WebsiteContentContext';
import TenantDetector from './components/TenantDetector';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import BCDDashboard from './pages/BCDDashboard';
import CDFDashboard from './pages/CDFDashboard';
import RestaurantWebsite from './pages/RestaurantWebsite';
import BCDRestaurantPage from './pages/BCDRestaurantPage';
import CDFRestaurantPage from './pages/CDFRestaurantPage';
import DynamicRestaurantPage from './pages/DynamicRestaurantPage';
import OrderingPage from './pages/OrderingPage';
import POSPage from './pages/POSPage';
import WebsiteContentManager from './pages/WebsiteContentManager';
import ProtectedRoute from './components/ProtectedRoute';

// Dynamic route component based on tenant
const TenantAwareRoutes = () => {
  const { tenant, loading } = useTenant();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If subdomain or custom domain (not central), show restaurant landing page
  if (tenant && !tenant.isCentral) {
    return (
      <Routes>
        {/* Subdomain/Custom domain routes - Restaurant specific */}
        <Route path="/" element={<DynamicRestaurantPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/order" element={<OrderingPage />} />
        
        {/* Admin routes accessible from restaurant domain */}
        <Route path="/admin" element={
          <ProtectedRoute>
            {tenant.id === 'bcd' ? <BCDDashboard /> : 
             tenant.id === 'cdf' ? <CDFDashboard /> : 
             <Dashboard />}
          </ProtectedRoute>
        } />
        <Route path="/pos" element={
          <ProtectedRoute>
            <POSPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/website" element={
          <ProtectedRoute>
            <WebsiteContentManager />
          </ProtectedRoute>
        } />
        
        {/* Redirect any other routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Central domain routes (restro24.com)
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<RestaurantWebsite />} />
      <Route path="/restaurants/bcd" element={<BCDRestaurantPage />} />
      <Route path="/restaurants/cdf" element={<CDFRestaurantPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/order" element={<OrderingPage />} />
      
      {/* Protected admin routes - Central domain */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/bcd" element={
        <ProtectedRoute>
          <BCDDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/cdf" element={
        <ProtectedRoute>
          <CDFDashboard />
        </ProtectedRoute>
      } />
      <Route path="/pos" element={
        <ProtectedRoute>
          <POSPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/website" element={
        <ProtectedRoute>
          <WebsiteContentManager />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <OrderProvider>
          <WebsiteContentProvider>
            <Router>
              <TenantDetector>
                <TenantAwareRoutes />
              </TenantDetector>
            </Router>
          </WebsiteContentProvider>
        </OrderProvider>
      </AuthProvider>
    </TenantProvider>
  );
}

export default App;