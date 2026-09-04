import React, { useState, useEffect } from 'react';
import { Wrench, MapPin, Clock, CheckCircle2, Play, CheckCheck, Star, AlertCircle, Phone, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { requestAPI, workerAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completionNotes, setCompletionNotes] = useState({});
  const [activeCompletingId, setActiveCompletingId] = useState(null);

  const fetchWorkerJobs = async () => {
    try {
      const res = await requestAPI.getRequests();
      setJobs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerJobs();
  }, []);

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      const notes = completionNotes[jobId] || 'Job completed cleanly.';
      await requestAPI.updateStatus(jobId, newStatus, notes);
      fetchWorkerJobs();
      if (newStatus === 'COMPLETED') {
        setActiveCompletingId(null);
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      
      {/* Mobile Header Banner */}
      <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/30">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Welcome, {user?.name || 'Staff Member'}</h1>
            <p className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
              <span className="text-slate-300 font-medium">{user?.email}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Ready for Dispatch</span>
            </p>
          </div>
        </div>
      </div>

      {/* Today's Jobs List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-white">Assigned Jobs</h2>
          <span className="text-xs text-slate-400 font-mono">{jobs.length} Job(s)</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading assigned jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="glass-card p-8 text-center rounded-2xl border border-slate-800">
            <CheckCheck className="w-10 h-10 mx-auto text-emerald-400 mb-2 opacity-60" />
            <h3 className="text-sm font-semibold text-slate-300">No jobs assigned yet.</h3>
            <p className="text-xs text-slate-500 mt-1">New maintenance tickets assigned by management will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const isCompleting = activeCompletingId === job.id;

              return (
                <div key={job.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                        #{job.ticket_code}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">{job.subcategory || job.description}</h3>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    "{job.description}"
                  </p>

                  {/* Location & Time info */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center space-x-1.5 text-slate-200 font-semibold">
                      <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{job.block} • Flat {job.flat_number}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>{job.start_time || '10:00 AM'} ({job.estimated_duration || 45}m)</span>
                    </div>
                  </div>

                  {/* Resident Info */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
                    <span>Resident: <strong>{job.resident_name}</strong></span>
                    <a 
                      href={`tel:${job.resident_phone || '+919876543210'}`}
                      className="text-blue-400 font-semibold flex items-center space-x-1 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Resident</span>
                    </a>
                  </div>

                  {/* Action Buttons based on status */}
                  <div className="pt-2">
                    {job.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleUpdateStatus(job.id, 'WORKER_ON_WAY')}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-600/30"
                      >
                        <Play className="w-4 h-4" />
                        <span>I Am On The Way</span>
                      </button>
                    )}

                    {job.status === 'WORKER_ON_WAY' && (
                      <button
                        onClick={() => handleUpdateStatus(job.id, 'IN_PROGRESS')}
                        className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-sky-600/30"
                      >
                        <Wrench className="w-4 h-4" />
                        <span>Start Work (Mark In Progress)</span>
                      </button>
                    )}

                    {job.status === 'IN_PROGRESS' && !isCompleting && (
                      <button
                        onClick={() => setActiveCompletingId(job.id)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-600/30"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Job Completed</span>
                      </button>
                    )}

                    {/* Completion Notes Input Modal/Box */}
                    {isCompleting && (
                      <div className="space-y-3 bg-slate-900 p-3 rounded-xl border border-emerald-500/40 animate-in fade-in-50">
                        <label className="block text-[11px] font-bold text-emerald-400">Enter Completion Notes:</label>
                        <input
                          type="text"
                          placeholder="e.g. Replaced damaged tap washer."
                          value={completionNotes[job.id] || ''}
                          onChange={(e) => setCompletionNotes({ ...completionNotes, [job.id]: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateStatus(job.id, 'COMPLETED')}
                            className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                          >
                            Submit Completion
                          </button>
                          <button
                            onClick={() => setActiveCompletingId(null)}
                            className="px-3 py-2 bg-slate-800 text-slate-400 rounded-lg text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {job.status === 'COMPLETED' && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 text-center font-semibold flex items-center justify-center space-x-1.5">
                        <CheckCheck className="w-4 h-4" />
                        <span>Completed (Notes: "{job.notes || 'Replaced damaged tap washer'} ")</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
