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
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      
      {/* Mobile Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-theme-border flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-primary flex items-center justify-center font-bold text-lg border border-teal-100">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-navy-primary">Welcome, {user?.name || 'Staff Member'}</h1>
            <p className="text-xs text-slate-gray flex items-center space-x-2 mt-0.5">
              <span className="text-charcoal font-medium">{user?.email}</span>
              <span>•</span>
              <span className="text-semantic-success font-semibold">Ready for Dispatch</span>
            </p>
          </div>
        </div>
      </div>

      {/* Today's Jobs List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-navy-primary">Assigned Jobs</h2>
          <span className="text-xs text-slate-gray font-mono font-medium">{jobs.length} Job(s)</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-gray text-sm font-medium">Loading assigned jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-theme-border shadow-sm">
            <CheckCheck className="w-10 h-10 mx-auto text-teal-primary mb-2 opacity-80" />
            <h3 className="text-sm font-semibold text-charcoal">No jobs assigned yet.</h3>
            <p className="text-xs text-slate-gray mt-1">New maintenance tickets assigned by management will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const isCompleting = activeCompletingId === job.id;

              return (
                <div key={job.id} className="bg-white p-5 rounded-2xl border border-theme-border space-y-4 shadow-sm">
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-teal-primary bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                        #{job.ticket_code}
                      </span>
                      <h3 className="text-base font-bold text-navy-primary mt-1">{job.subcategory || job.description}</h3>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>

                  <p className="text-xs text-charcoal leading-relaxed bg-[#F7F9F8] p-3 rounded-xl border border-theme-border">
                    "{job.description}"
                  </p>

                  {/* Location & Time info */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#F7F9F8] p-3 rounded-xl border border-theme-border">
                    <div className="flex items-center space-x-1.5 text-charcoal font-semibold">
                      <MapPin className="w-4 h-4 text-teal-primary shrink-0" />
                      <span>{job.block} • Flat {job.flat_number}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-navy-primary font-semibold">
                      <Clock className="w-4 h-4 text-slate-gray shrink-0" />
                      <span>{job.start_time || '10:00 AM'} ({job.estimated_duration || 45}m)</span>
                    </div>
                  </div>

                  {/* Resident Info */}
                  <div className="flex items-center justify-between text-xs text-slate-gray pt-1 border-t border-theme-border/60">
                    <span>Resident: <strong className="text-charcoal">{job.resident_name}</strong></span>
                    <a 
                      href={`tel:${job.resident_phone || '+919876543210'}`}
                      className="text-teal-primary font-semibold flex items-center space-x-1 hover:underline"
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
                        className="w-full py-2.5 bg-teal-primary hover:bg-[#13887B] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-sm"
                      >
                        <Play className="w-4 h-4" />
                        <span>I Am On The Way</span>
                      </button>
                    )}

                    {job.status === 'WORKER_ON_WAY' && (
                      <button
                        onClick={() => handleUpdateStatus(job.id, 'IN_PROGRESS')}
                        className="w-full py-2.5 bg-navy-primary hover:bg-[#1b4366] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-sm"
                      >
                        <Wrench className="w-4 h-4 text-teal-primary" />
                        <span>Start Work (Mark In Progress)</span>
                      </button>
                    )}

                    {job.status === 'IN_PROGRESS' && !isCompleting && (
                      <button
                        onClick={() => setActiveCompletingId(job.id)}
                        className="w-full py-2.5 bg-semantic-success hover:bg-[#1c8658] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Job Completed</span>
                      </button>
                    )}

                    {/* Completion Notes Input Modal/Box */}
                    {isCompleting && (
                      <div className="space-y-3 bg-[#F7F9F8] p-3.5 rounded-xl border border-teal-200">
                        <label className="block text-[11px] font-bold text-navy-primary">Enter Completion Notes:</label>
                        <input
                          type="text"
                          placeholder="e.g. Replaced damaged tap washer."
                          value={completionNotes[job.id] || ''}
                          onChange={(e) => setCompletionNotes({ ...completionNotes, [job.id]: e.target.value })}
                          className="w-full bg-white border border-theme-border rounded-lg p-2 text-xs text-charcoal placeholder-slate-400 focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateStatus(job.id, 'COMPLETED')}
                            className="flex-1 py-2 bg-semantic-success hover:bg-[#1c8658] text-white font-bold rounded-lg text-xs shadow-sm transition-colors"
                          >
                            Submit Completion
                          </button>
                          <button
                            onClick={() => setActiveCompletingId(null)}
                            className="px-3 py-2 bg-white border border-theme-border text-slate-gray hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {job.status === 'COMPLETED' && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-center font-semibold flex items-center justify-center space-x-1.5">
                        <CheckCheck className="w-4 h-4 text-emerald-600" />
                        <span>Completed (Notes: "{job.notes || 'Job finished successfully'} ")</span>
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
