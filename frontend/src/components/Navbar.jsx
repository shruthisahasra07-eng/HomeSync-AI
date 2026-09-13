import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bot, Bell, LogOut, User, Shield, Wrench, BarChart2, PlusCircle, ClipboardList, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import NotificationPanel from './NotificationPanel';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await notificationAPI.getNotifications();
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-navy-50 text-navy-800 border border-navy-200">Admin</span>;
      case 'WORKER':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">Staff</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">Resident</span>;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4E9ED] shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg text-[#12304A] tracking-tight">HOME</span>
                <span className="font-extrabold text-lg text-[#18A999] tracking-tight">SYNC</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-[#18A999] border border-teal-200">AI</span>
              </div>
              <span className="text-[10px] text-[#667085] block -mt-0.5">Smarter Living. Seamless Maintenance.</span>
            </div>
          </Link>

          {/* User Navigation & Actions */}
          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-4">
              
              {/* Role-Specific Navigation Links */}
              <nav className="hidden md:flex items-center space-x-2">
                {user.role === 'RESIDENT' && (
                  <>
                    <Link
                      to="/resident"
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        location.pathname === '/resident' ? 'bg-teal-50 text-[#18A999] border border-teal-200' : 'text-[#667085] hover:text-[#12304A] hover:bg-slate-50'
                      }`}
                    >
                      My Requests
                    </Link>
                    <Link
                      to="/resident/report"
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#18A999] hover:bg-[#13887B] text-white flex items-center space-x-1.5 shadow-sm transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Report Problem</span>
                    </Link>
                  </>
                )}

                {user.role === 'ADMIN' && (
                  <>
                    <Link
                      to="/admin"
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        location.pathname === '/admin' ? 'bg-teal-50 text-[#18A999] border border-teal-200' : 'text-[#667085] hover:text-[#12304A] hover:bg-slate-50'
                      }`}
                    >
                      Control Room
                    </Link>
                    <Link 
                      to="/admin/analytics" 
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        location.pathname === '/admin/analytics' ? 'bg-teal-50 text-[#18A999] border border-teal-200' : 'text-[#667085] hover:text-[#12304A] hover:bg-slate-50'
                      }`}
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-[#18A999]" />
                      <span>Analytics</span>
                    </Link>
                  </>
                )}

                {user.role === 'WORKER' && (
                  <Link
                    to="/worker"
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      location.pathname === '/worker' ? 'bg-teal-50 text-[#18A999] border border-teal-200' : 'text-[#667085] hover:text-[#12304A] hover:bg-slate-50'
                    }`}
                  >
                    Job Queue
                  </Link>
                )}
              </nav>

              {/* Notification Bell */}
              <button 
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 rounded-xl bg-white hover:bg-slate-50 text-[#667085] hover:text-[#12304A] transition-colors border border-[#E4E9ED] shadow-subtle"
                aria-label="Open notifications"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D64545] text-white text-[9px] font-extrabold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Profile Info */}
              <div className="flex items-center space-x-2.5 pl-2.5 border-l border-[#E4E9ED]">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-[#12304A] leading-tight">{user.name}</div>
                  <div className="text-[10px] text-[#667085]">
                    {user.role === 'RESIDENT' ? `${user.block} • Flat ${user.flat_number}` : user.email}
                  </div>
                </div>
                {getRoleBadge(user.role)}
              </div>

              {/* Logout Button */}
              <button 
                onClick={() => { logout(); navigate('/login'); }}
                className="p-2 rounded-xl text-[#667085] hover:text-[#D64545] hover:bg-red-50 transition-colors"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>

            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link 
                to="/register"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#667085] hover:text-[#12304A] hover:bg-slate-50 transition-colors"
              >
                Resident Sign Up
              </Link>
              <Link 
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#18A999] hover:bg-[#13887B] text-white transition-all shadow-sm"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Slide-over Notification Panel Drawer */}
      <NotificationPanel 
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
      />
    </>
  );
}
