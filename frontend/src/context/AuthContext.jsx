import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('farmfi_user')); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authService.login({ email, password });
      
      if (data.requires_otp || data.message?.toLowerCase().includes('otp')) {
        return { success: true, requiresOtp: true };
      }
      
      localStorage.setItem('farmfi_token', data.token);
      localStorage.setItem('farmfi_user',  JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, requiresOtp: false };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    setLoading(true);
    try {
      const { data } = await authService.verifyOtp({ email, otp });
      localStorage.setItem('farmfi_token', data.token);
      localStorage.setItem('farmfi_user',  JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Invalid OTP' };
    } finally {
      setLoading(false);
    }
  }, []);

  const resendOtp = useCallback(async (email) => {
    setLoading(true);
    try {
      await authService.resendOtp({ email });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to resend OTP' };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setLoading(true);
    try {
      const { data } = await authService.register(formData);
      if (data?.requires_otp || data?.message?.toLowerCase().includes('otp')) {
        return { success: true, requiresOtp: true };
      }
      return { success: true, requiresOtp: false };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('farmfi_token');
    localStorage.removeItem('farmfi_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, verifyOtp, resendOtp }}>
      {children}
    </AuthContext.Provider>
  );
}
