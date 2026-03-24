import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';


export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'Farmer' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    const result = await register(form);
    if (result.success) {
      if (result.requiresOtp) {
        toast.success('Account created! Validating OTP is required. Please login.');
      } else {
        toast.success('Account created! Please sign in.');
      }
      navigate('/login');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page">

      
      <div className="auth-card">
        <div className="auth-logo">🌻 <span>FarmFi</span></div>
        <h1>Create your account</h1>
        <p className="auth-sub">Join the smart farming platform</p>

        {error && <div className="alert alert-error"><span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</span></div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="full_name" value={form.full_name} onChange={handle} required placeholder="John Farmer" />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handle} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input name="phone" type="tel" value={form.phone} onChange={handle} required placeholder="+91 9876543210" />
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
                placeholder="Min. 6 characters" 
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
          <div className="form-group">
            <label>I am a</label>
            <select name="role" value={form.role} onChange={handle} style={{ 
              width: '100%', 
              padding: '13px 16px', 
              borderRadius: '12px', 
              border: '1.5px solid rgba(255,255,255,0.08)',
              outline: 'none',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.92rem',
              background: 'rgba(255,255,255,0.04)',
              color: '#fafafa',
              transition: 'all 0.2s ease'
            }}>
              <option value="Farmer">Farmer</option>
              <option value="Worker">Agricultural Worker</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-link">Already have an account? <Link to="/login" style={{ color: '#34d399', fontWeight: 600 }}>Sign in</Link></p>
      </div>

      <style>{`
        .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(rgba(9, 9, 11, 0.65), rgba(9, 9, 11, 0.95)), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat fixed; position: relative; overflow: hidden; padding: 24px; }
        .auth-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border-radius: 24px; padding: 44px; width: 100%; max-width: 440px; border: 1px solid rgba(255, 255, 255, 0.06); z-index: 10; position: relative; animation: cardEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes cardEntrance { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .auth-logo { display: flex; align-items: center; gap: 10px; font-family: 'Space Grotesk', sans-serif; font-size: 1.75rem; font-weight: 700; color: #fff; margin-bottom: 28px; letter-spacing: -0.03em; }
        .auth-card h1 { font-family: 'Space Grotesk', sans-serif; font-size: 1.4rem; font-weight: 700; margin-bottom: 6px; color: #fafafa; letter-spacing: -0.025em; }
        .auth-sub { color: rgba(255,255,255,0.4); font-size: 0.88rem; margin-bottom: 28px; }
        .auth-page .form-group { margin-bottom: 18px; }
        .auth-page .form-group label { display: block; font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 8px; letter-spacing: 0.02em; text-transform: uppercase; }
        .auth-page .form-group input, .auth-page .form-group select { width: 100%; padding: 13px 16px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,0.08); font-family: 'Inter', sans-serif; font-size: 0.92rem; transition: all 0.2s ease; box-sizing: border-box; background: rgba(255,255,255,0.04); color: #fafafa; }
        .auth-page .form-group input:focus, .auth-page .form-group select:focus { outline: none; background: rgba(255,255,255,0.06); border-color: rgba(16, 185, 129, 0.5); box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
        .auth-page .form-group input::placeholder { color: rgba(255,255,255,0.2); }
        .auth-page .form-group select option { background: #18181b; color: #fafafa; }
        .auth-page .btn-primary { background: linear-gradient(135deg, #059669, #10b981, #34d399); background-size: 200% 200%; color: #fff; border: none; padding: 14px; border-radius: 12px; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3); animation: gradientShift 4s ease infinite; }
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .auth-page .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(16, 185, 129, 0.45); }
        .auth-page .btn-primary:active { transform: translateY(0); }
        .auth-page .btn-primary:disabled { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.3); cursor: not-allowed; transform: none; box-shadow: none; animation: none; }
        .auth-link { text-align: center; font-size: 0.88rem; margin-top: 24px; color: rgba(255,255,255,0.35); }
        .auth-link a { color: #34d399 !important; font-weight: 600; }
        .auth-link a:hover { color: #6ee7b7 !important; }
        .auth-page .alert { padding: 14px; border-radius: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.15); margin-bottom: 24px; }
        .auth-page .alert span { color: #f87171 !important; }
      `}</style>
    </div>
  );
}
