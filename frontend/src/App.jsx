import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Disease from './pages/Disease';
import Weather from './pages/Weather';
import Risk from './pages/Risk';
import CropRecommendation from './pages/CropRecommendation';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import Credit from './pages/Credit';
import Workers from './pages/Workers';
import Admin from './pages/Admin';
import PlantingCalendar from './pages/PlantingCalendar';
import './styles/global.css';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
                <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
              } />
              <Route path="/disease" element={
                <ProtectedRoute roles={['Farmer', 'Worker']}><Layout><Disease /></Layout></ProtectedRoute>
              } />
              <Route path="/weather" element={
                <ProtectedRoute><Layout><Weather /></Layout></ProtectedRoute>
              } />
              <Route path="/risk" element={
                <ProtectedRoute roles={['Farmer']}><Layout><Risk /></Layout></ProtectedRoute>
              } />
              <Route path="/crop" element={
                <ProtectedRoute roles={['Farmer', 'Worker']}><Layout><CropRecommendation /></Layout></ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute roles={['Farmer']}><Layout><PlantingCalendar /></Layout></ProtectedRoute>
              } />
              <Route path="/marketplace" element={
                <ProtectedRoute><Layout><Marketplace /></Layout></ProtectedRoute>
              } />
              <Route path="/marketplace/:id" element={
                <ProtectedRoute><Layout><ProductDetail /></Layout></ProtectedRoute>
              } />
              <Route path="/credit" element={
                <ProtectedRoute roles={['Farmer']}><Layout><Credit /></Layout></ProtectedRoute>
              } />
              <Route path="/workers" element={
                <ProtectedRoute><Layout><Workers /></Layout></ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute roles={['Admin']}><Admin /></ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
