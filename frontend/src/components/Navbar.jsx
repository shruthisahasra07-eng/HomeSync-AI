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
        return <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Admin</span>;
      case 'WORKER':
        return <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Staff</span>;
      default:
        return <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Resident</span>;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">HomeSync</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">AI</span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5">Smarter Living. Seamless Maintenance.</span>
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
                        location.pathname === '/resident' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      My Requests
                    </Link>
                    <Link
                      to="/resident/report"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition-all"
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
                        location.pathname === '/admin' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      Control Room
                    </Link>
                    <Link 
                      to="/admin/analytics" 
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        location.pathname === '/admin/analytics' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Analytics</span>
                    </Link>
                  </>
                )}

                {user.role === 'WORKER' && (
                  <Link
                    to="/worker"
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      location.pathname === '/worker' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Job Queue
                  </Link>
                )}
              </nav>

              {/* Notification Bell */}
              <button 
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                aria-label="Open notifications"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Profile Info */}
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight">{user.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {user.role === 'RESIDENT' ? `${user.block} • Flat ${user.flat_number}` : user.email}
                  </div>
                </div>
                {getRoleBadge(user.role)}
              </div>

              {/* Logout Button */}
              <button 
                onClick={() => { logout(); navigate('/login'); }}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Resident Sign Up
              </Link>
              <Link 
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/30"
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
