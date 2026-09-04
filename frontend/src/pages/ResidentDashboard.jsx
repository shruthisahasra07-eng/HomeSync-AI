import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Clock, Calendar, CheckCircle2, Wrench, ChevronRight, User, MapPin, AlertCircle, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { requestAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import RatingModal from '../components/RatingModal';

export default function ResidentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForRating, setSelectedForRating] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await requestAPI.getRequests();
      setRequests(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const activeCount = requests.filter(r => ['PENDING', 'AI_ANALYZED', 'ASSIGNED', 'WORKER_ON_WAY', 'IN_PROGRESS'].includes(r.status)).length;
  const scheduledCount = requests.filter(r => r.status === 'SCHEDULED').length;
  const completedCount = requests.filter(r => r.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Resident Profile Banner & Main CTA */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-500/30">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name || 'Resident'}</h1>
              <p className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{user?.block || 'Block C'} • Flat {user?.flat_number || 'C-304'}</span>
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/resident/report"
          className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span>+ Report a Problem</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-6 rounded-2xl border border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Requests</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400"><Clock className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-4">{activeCount}</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-cyan-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Scheduled Visits</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400"><Calendar className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-4">{scheduledCount}</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Completed Requests</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><CheckCircle2 className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-4">{completedCount}</div>
        </div>
      </div>

      {/* Recent Maintenance Requests */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Your Maintenance Requests</h2>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl border border-slate-800">
            <Wrench className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No maintenance requests yet.</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              If something requires repair in your flat or common areas, submit a request below.
            </p>
            <Link 
              to="/resident/report"
              className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Report a Problem</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((req) => (
              <div 
                key={req.id} 
                className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      #{req.ticket_code}
                    </span>
                    <StatusBadge status={req.status} />
                    <span className="text-xs text-slate-400 font-medium">{req.category}</span>
                  </div>

                  <h3 className="text-base font-bold text-white">{req.subcategory || req.description}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{req.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{req.block} • {req.flat_number}</span>
                    </span>
                    {req.worker_name && (
                      <span className="flex items-center space-x-1 text-slate-300 font-medium">
                        <Wrench className="w-3.5 h-3.5 text-blue-400" />
                        <span>Worker: {req.worker_name}</span>
                      </span>
                    )}
                    {req.start_time && (
                      <span className="flex items-center space-x-1 text-cyan-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{req.scheduled_date || 'Today'}: {req.start_time} – {req.end_time}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end md:self-center">
                  {req.status === 'COMPLETED' && (
                    <button
                      onClick={() => setSelectedForRating(req)}
                      className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>Rate Worker</span>
                    </button>
                  )}

                  <Link
                    to={`/requests/${req.id}`}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="View Request Details"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RatingModal
        isOpen={!!selectedForRating}
        onClose={() => setSelectedForRating(null)}
        request={selectedForRating}
        onRatingSubmitted={fetchRequests}
      />
    </div>
  );
}
