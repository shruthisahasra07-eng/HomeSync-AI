import React, { useEffect } from 'react';
import { Bell, CheckCheck, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function NotificationPanel({ isOpen, onClose, notifications, onMarkAllRead }) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-[#22A06B] shrink-0" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-[#E8A317] shrink-0" />;
      default: return <Info className="w-5 h-5 text-[#18A999] shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed Backdrop Scrim */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-[#12304A]/30 backdrop-blur-xs transition-opacity animate-in fade-in"
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full sm:w-96 max-w-full h-full bg-white border-l border-[#E4E9ED] shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#E4E9ED] flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#12304A]">Notifications</h3>
              <p className="text-[10px] text-[#667085]">{notifications.filter(n => !n.is_read).length} unread</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {notifications.length > 0 && (
              <button 
                onClick={onMarkAllRead}
                className="text-xs text-teal-700 hover:text-teal-800 flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 transition-colors border border-teal-200 font-medium"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Mark read</span>
              </button>
            )}
            <button 
              onClick={onClose} 
              className="text-[#667085] hover:text-[#12304A] p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F9F8]">
          {notifications.length === 0 ? (
            <div className="text-center py-20 text-[#667085] space-y-2">
              <Bell className="w-10 h-10 mx-auto opacity-30 text-[#667085]" />
              <p className="text-sm font-semibold text-[#12304A]">No new notifications.</p>
              <p className="text-xs text-[#667085] max-w-xs mx-auto">
                Updates regarding your maintenance requests and schedule changes will appear here.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-3.5 rounded-2xl border transition-all ${
                  n.is_read 
                    ? 'bg-white border-[#E4E9ED] opacity-80' 
                    : 'bg-white border-teal-300 shadow-sm ring-1 ring-teal-100'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#12304A]">{n.title}</h4>
                    <p className="text-xs text-[#17212B] mt-1 leading-relaxed break-words">{n.message}</p>
                    <span className="text-[10px] text-[#667085] mt-2 block font-mono">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-[#E4E9ED] bg-white text-center">
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-[#667085] hover:text-[#12304A] rounded-xl hover:bg-slate-50 transition-colors"
          >
            Close Notifications
          </button>
        </div>

      </div>
    </div>
  );
}
