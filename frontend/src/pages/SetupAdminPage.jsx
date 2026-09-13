import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, User, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function SetupAdminPage() {
  const { setupAdmin } = useAuth();
  const navigate = useNavigate();

  const [hasAdmin, setHasAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authAPI.getSetupStatus()
      .then(res => setHasAdmin(res.data.hasAdmin))
      .catch(() => setHasAdmin(false));
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await setupAdmin({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password
      });
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (hasAdmin === true) {
    return (
      <div className="min-h-screen bg-[#F7F9F8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#E4E9ED] text-center space-y-4 shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#18A999] flex items-center justify-center mx-auto border border-teal-100">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#12304A]">Administrator Configured</h2>
          <p className="text-xs text-[#667085] leading-relaxed">
            An administrator account is already configured for this HomeSync instance. Please log in using your administrator credentials.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-[#18A999] hover:bg-[#13887B] text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-4 text-[#18A999] shadow-subtle">
            <Shield className="w-8 h-8 text-[#18A999]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#12304A]">Initial Administrator Setup</h1>
          <p className="text-xs text-[#667085] mt-1">Initialize the primary administrator account for this community</p>
        </div>

        {/* Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E4E9ED] shadow-card">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-[#D64545] text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">Administrator Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Vikram Rao (Facility Manager)"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#E4E9ED] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#17212B] placeholder-[#98A2B3] focus:outline-none focus:border-[#18A999] focus:ring-2 focus:ring-[#18A999]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">Administrator Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@homesync.ai"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#E4E9ED] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#17212B] placeholder-[#98A2B3] focus:outline-none focus:border-[#18A999] focus:ring-2 focus:ring-[#18A999]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">Contact Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 00000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#E4E9ED] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#17212B] placeholder-[#98A2B3] focus:outline-none focus:border-[#18A999] focus:ring-2 focus:ring-[#18A999]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">Administrator Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#E4E9ED] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#17212B] placeholder-[#98A2B3] focus:outline-none focus:border-[#18A999] focus:ring-2 focus:ring-[#18A999]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#E4E9ED] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#17212B] placeholder-[#98A2B3] focus:outline-none focus:border-[#18A999] focus:ring-2 focus:ring-[#18A999]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#18A999] hover:bg-[#13887B] text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Initializing Administrator...' : 'Initialize Administrator'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#667085]">
            Already have an administrator account?{' '}
            <Link to="/login" className="text-[#18A999] font-semibold hover:text-[#13887B]">
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
