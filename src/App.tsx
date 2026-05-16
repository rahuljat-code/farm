import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Products from './pages/Products';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Confirmation from './pages/Confirmation';

function AppContent() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products" element={<Products />} />
        <Route
          path="/farmer-dashboard"
          element={
            <ProtectedRoute requiredRole="farmer">
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-dashboard"
          element={
            <ProtectedRoute requiredRole="buyer">
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/confirmation"
          element={
            <ProtectedRoute requiredRole="buyer">
              <Confirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            profile ? (
              <Navigate to={profile.role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
