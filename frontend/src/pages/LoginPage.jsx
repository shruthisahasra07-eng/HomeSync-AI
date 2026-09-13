import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, Mail, Lock, ArrowRight, ShieldAlert, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(true);

  useEffect(() => {
    authAPI.getSetupStatus()
      .then(res => setHasAdmin(res.data.hasAdmin))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const userData = await login(email.trim(), password);
      if (userData.role === 'RESIDENT') navigate('/resident');
      else if (userData.role === 'ADMIN') navigate('/admin');
      else if (userData.role === 'WORKER') navigate('/worker');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2.5 mb-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto text-[#18A999] shadow-subtle">
              <Bot className="w-6 h-6 text-[#18A999]" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#12304A] tracking-tight">Sign in to HomeSync AI</h1>
          <p className="text-xs text-[#667085] mt-1">Enter your account credentials to access your portal</p>
        </div>

        {/* First-Time Admin Notice */}
        {!hasAdmin && (
          <div className="mb-6 p-4 rounded-2xl bg-teal-50 border border-teal-200 text-[#12304A] text-xs flex items-center justify-between shadow-subtle">
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-5 h-5 text-[#18A999] shrink-0" />
              <div>
                <span className="font-bold block text-[#12304A]">First-Time Setup Detected</span>
                <span className="text-[11px] text-[#667085]">No administrator account exists yet.</span>
              </div>
            </div>
            <Link
              to="/setup-admin"
              className="px-3 py-1.5 bg-[#18A999] hover:bg-[#13887B] text-white font-semibold rounded-xl text-[11px] transition-colors shrink-0 shadow-sm"
            >
              Setup Admin
            </Link>
          </div>
        )}

        {/* Login Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E4E9ED] shadow-card">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-[#D64545] text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#E4E9ED] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#17212B] placeholder-[#98A2B3] focus:outline-none focus:border-[#18A999] focus:ring-2 focus:ring-[#18A999]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#E4E9ED] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#17212B] placeholder-[#98A2B3] focus:outline-none focus:border-[#18A999] focus:ring-2 focus:ring-[#18A999]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#18A999] hover:bg-[#13887B] text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E4E9ED] text-center text-xs text-[#667085] space-y-2">
            <div>
              New resident in the community?{' '}
              <Link to="/register" className="text-[#18A999] font-semibold hover:text-[#13887B] underline underline-offset-4">
                Create an Account
              </Link>
            </div>
            <div>
              Need to initialize the system?{' '}
              <Link to="/setup-admin" className="text-[#667085] hover:text-[#12304A]">
                Administrator Setup
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
