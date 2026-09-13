import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, User, Mail, Phone, Lock, Building, MapPin, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { blockAPI } from '../services/api';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [blocks, setBlocks] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    block: '',
    flat_number: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    blockAPI.getBlocks()
      .then(res => {
        setBlocks(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, block: prev.block || res.data[0].name }));
        }
      })
      .catch(err => {
        console.error('Failed to load blocks:', err);
      });
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.block || !formData.flat_number.trim()) {
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
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        block: formData.block.trim(),
        flat_number: formData.flat_number.trim()
      });
      navigate('/resident');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2.5 mb-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#18A999] shadow-subtle">
              <Bot className="w-6 h-6 text-[#18A999]" />
            </div>
            <span className="font-extrabold text-2xl text-[#12304A] tracking-tight">HOME<span className="text-[#18A999]">SYNC</span> <span className="text-[#18A999]">AI</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-[#12304A]">Resident Account Registration</h1>
          <p className="text-xs text-[#667085] mt-1">Join your community maintenance network</p>
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
              <label className="block text-xs font-semibold text-[#17212B] mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#E4E9ED] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#17212B] placeholder-[#98A2B3] focus:outline-none focus:border-[#18A999] focus:ring-2 focus:ring-[#18A999]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white border border-[#E4E9ED] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#17212B] placeholder-[#98A2B3] focus:outline-none focus:border-[#18A999] focus:ring-2 focus:ring-[#18A999]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-white border border-[#E4E9ED] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#17212B] placeholder-[#98A2B3] focus:outline-none focus:border-[#18A999] focus:ring-2 focus:ring-[#18A999]/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Apartment Block *</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    name="block"
                    required
                    value={formData.block}
                    onChange={handleChange}
                    className="w-full bg-white border border-[#E4E9ED] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#17212B] focus:outline-none focus:border-[#18A999] focus:ring-2 focus:ring-[#18A999]/20"
                  >
                    {blocks.length === 0 ? (
                      <option value="Block A">Block A</option>
                    ) : (
                      blocks.map(b => (
                        <option key={b.id} value={b.name}>{b.name} {b.details ? `(${b.details})` : ''}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Flat Number *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="flat_number"
                    required
                    placeholder="e.g. A-302"
                    value={formData.flat_number}
                    onChange={handleChange}
                    className="w-full bg-white border border-[#E4E9ED] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#17212B] placeholder-[#98A2B3] focus:outline-none focus:border-[#18A999] focus:ring-2 focus:ring-[#18A999]/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Password *</label>
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#18A999] hover:bg-[#13887B] text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#667085]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#18A999] font-semibold hover:text-[#13887B]">
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
