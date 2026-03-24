import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login, verifyOtp, resendOtp, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', otp: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitLogin = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      if (result.requiresOtp) {
        toast.success('OTP sent to your email');
        setStep(2);
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    setError('');
    const result = await verifyOtp(form.email, form.otp);
    if (result.success) {
      toast.success('Login verified!');
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const handleResendOtp = async () => {
    const result = await resendOtp(form.email);
    if (result.success) {
      toast.success('New OTP sent to your email');
    } else {
      setError(result.error || 'Failed to resend OTP');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🌻 <span>FarmFi</span></div>
        <h1>{step === 1 ? 'Sign in to your account' : 'Verify Email OTP'}</h1>
        <p className="auth-sub">{step === 1 ? 'Predictive Agriculture & Smart Marketplace' : `Enter the code sent to ${form.email}`}</p>

        {error && <div className="alert alert-error"><span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</span></div>}

        {step === 1 ? (
          <form onSubmit={submitLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handle} 
                required 
                placeholder="you@example.com" 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  name="password" 
                  type={showPassword ? 'text' : 'password'} 
                  value={form.password} 
                  onChange={handle} 
                  required 
                  placeholder="••••••••" 
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={submitOtp}>
            <div className="form-group">
              <label>Enter OTP Code</label>
              <input
                name="otp"
                type="text"
                value={form.otp}
                onChange={handle}
                required
                placeholder="6-digit code"
                maxLength={6}
                style={{ textAlign: 'center', letterSpacing: '0.2em', fontSize: '1.2rem' }}
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Login'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button type="button" onClick={handleResendOtp} disabled={loading} style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                Resend OTP
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}>
                Back to Login
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <p className="auth-link">Don't have an account? <Link to="/register" style={{ color: '#16a34a', fontWeight: 700 }}>Register</Link></p>
        )}
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(rgba(9, 9, 11, 0.65), rgba(9, 9, 11, 0.95)), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat fixed;
          position: relative;
          overflow: hidden;
          padding: 24px;
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 24px;
          padding: 48px;
          width: 100%;
          max-width: 420px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          z-index: 10;
          position: relative;
          animation: cardEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .auth-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 32px;
          letter-spacing: -0.03em;
        }

        .auth-card h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 6px;
          color: #fafafa;
          letter-spacing: -0.025em;
        }

        .auth-sub {
          color: rgba(255,255,255,0.4);
          font-size: 0.88rem;
          margin-bottom: 36px;
        }

        .auth-page .form-group { margin-bottom: 20px; }
        .auth-page .form-group label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          margin-bottom: 8px;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .auth-page .form-group input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.08);
          font-family: 'Inter', sans-serif;
          font-size: 0.92rem;
          transition: all 0.2s ease;
          box-sizing: border-box;
          background: rgba(255,255,255,0.04);
          color: #fafafa;
        }
        .auth-page .form-group input:focus {
          outline: none;
          background: rgba(255,255,255,0.06);
          border-color: rgba(16, 185, 129, 0.5);
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }
        .auth-page .form-group input::placeholder { color: rgba(255,255,255,0.2); }

        .auth-page .btn-primary {
          background: linear-gradient(135deg, #059669, #10b981, #34d399);
          background-size: 200% 200%;
          color: #fff;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
          animation: gradientShift 4s ease infinite;
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .auth-page .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(16, 185, 129, 0.45);
        }
        .auth-page .btn-primary:active { transform: translateY(0); }
        .auth-page .btn-primary:disabled {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.3);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
          animation: none;
        }

        .auth-link {
          text-align: center;
          font-size: 0.88rem;
          margin-top: 28px;
          color: rgba(255,255,255,0.35);
        }
        .auth-link a { color: #34d399 !important; font-weight: 600; }
        .auth-link a:hover { color: #6ee7b7 !important; }

        .auth-page .alert {
          padding: 14px;
          border-radius: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.15);
          margin-bottom: 24px;
        }
        .auth-page .alert span { color: #f87171 !important; }
      `}</style>
    </div>
  );
}
