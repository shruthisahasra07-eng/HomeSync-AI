import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Bot, User, Wrench, Calendar, Clock, MapPin, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, Star, Edit3, XCircle } from 'lucide-react';
import { requestAPI, workerAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';

export default function AdminRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await requestAPI.getRequestById(id);
      setDetailData(res.data);
      if (res.data.assignment) {
        setSelectedWorkerId(res.data.assignment.worker_id);
      } else if (res.data.workerRanking?.recommendedWorker) {
        setSelectedWorkerId(res.data.workerRanking.recommendedWorker.workerId);
      }
      if (res.data.schedule) {
        setSelectedDate(res.data.schedule.scheduled_date || 'Today');
        setSelectedTime(res.data.schedule.start_time || '10:00 AM');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="max-w-7xl mx-auto p-8 text-center text-slate-500">Loading detail data...</div>;
  }

  if (!detailData || !detailData.request) {
    return <div className="max-w-7xl mx-auto p-8 text-center text-red-400">Request not found</div>;
  }

  const { request, assignment, schedule, rating, workerRanking, scheduleSlots } = detailData;
  const recommendedWorker = workerRanking?.recommendedWorker;

  const handleApproveAssignment = async (overrideWorkerId = null) => {
    const targetWorkerId = overrideWorkerId || selectedWorkerId || (recommendedWorker ? recommendedWorker.workerId : null);
    if (!targetWorkerId) {
      alert('Please select an eligible worker first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeSlot = scheduleSlots?.recommendedSlot?.startTimeFormatted === selectedTime 
        ? scheduleSlots?.recommendedSlot 
        : scheduleSlots?.alternativeSlots?.find(s => s.startTimeFormatted === selectedTime);

      const endTimeToUse = activeSlot?.endTimeFormatted || '11:00 AM';

      await requestAPI.approveAssignment(request.id, {
        workerId: targetWorkerId,
        date: selectedDate,
        startTime: selectedTime,
        endTime: endTimeToUse,
        isOverride: !!overrideWorkerId
      });
      await fetchDetail();
      alert('Assignment & Schedule Approved Successfully!');
    } catch (err) {
      alert('Failed to approve assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Button & Title */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-3">
          <StatusBadge status={request.status} />
          <span className="text-xs font-mono text-slate-400">Ticket #{request.ticket_code}</span>
        </div>
      </div>

      {/* Visual Request Timeline */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Request Lifecycle Timeline</h3>
        <Timeline currentStatus={request.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Complaint & AI Analysis */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Complaint Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                  {request.category} • {request.subcategory}
                </span>
                <h2 className="text-xl font-bold text-white mt-2">{request.description}</h2>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-extrabold ${
                request.priority === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {request.priority} Priority
              </span>
            </div>

            {/* Resident Information */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Resident Name</span>
                <span className="font-semibold text-slate-200">{request.resident_name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Apartment Flat</span>
                <span className="font-semibold text-slate-200">{request.block} • Flat {request.flat_number}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Phone Contact</span>
                <span className="font-semibold text-slate-200">{request.resident_phone || '+91 98765 43210'}</span>
              </div>
            </div>
          </div>

          {/* AI Analysis Panel */}
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">AI Complaint Understanding</h3>
              </div>
              <span className="text-xs text-emerald-400 font-extrabold">{request.ai_confidence || 94}% Confidence</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Trade Skill</span>
                <span className="font-bold text-blue-400">{request.required_skill}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Estimated Duration</span>
                <span className="font-bold text-purple-400">{request.estimated_duration || 45} mins</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Subcategory</span>
                <span className="font-bold text-white">{request.subcategory}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Priority Rating</span>
                <span className="font-bold text-amber-400">{request.priority}</span>
              </div>
            </div>

            <p className="text-xs text-indigo-200 bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 leading-relaxed">
              <strong>AI Diagnostic Reason:</strong> "{request.ai_reason}"
            </p>
          </div>

          {/* Transparent Smart Worker Match Breakdown */}
          <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Multi-Criteria Worker Ranking Engine</span>
              <span className="text-xs font-mono text-slate-400">Formula: 40% Skill + 25% Avail + 15% Travel + 10% Workload + 10% Rating</span>
            </h3>

            {(!workerRanking || !workerRanking.rankedWorkers || workerRanking.rankedWorkers.length === 0) ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
                <p className="text-sm font-semibold text-slate-300">No workers available for assignment.</p>
                <p className="text-xs text-slate-500 mt-1">Please register or activate staff in the Worker Management tab.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workerRanking.rankedWorkers.map((w, idx) => {
                  const isTop = idx === 0;
                  const isSelected = selectedWorkerId === w.workerId;

                  return (
                    <div 
                      key={w.workerId}
                      onClick={() => setSelectedWorkerId(w.workerId)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10' 
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isTop ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400'
                          }`}>
                            #{idx + 1}
                          </div>

                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-bold text-white">{w.workerName}</h4>
                              {isTop && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  Top Recommendation
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center space-x-3 mt-0.5">
                              <span>Skills: {w.skills?.join(', ') || 'General'}</span>
                              <span>•</span>
                              <span className="text-amber-400 flex items-center"><Star className="w-3 h-3 fill-amber-400 mr-0.5" />{w.rating}★</span>
                              <span>•</span>
                              <span className={w.availability === 'Available' ? 'text-emerald-400' : 'text-amber-400'}>{w.availability}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-extrabold text-emerald-400">{w.matchScore}%</div>
                          <span className="text-[10px] text-slate-500 block">Match Score</span>
                        </div>
                      </div>

                      {/* Score Metric Breakdown Pills */}
                      <div className="grid grid-cols-5 gap-1.5 mt-3 pt-3 border-t border-slate-800 text-[10px] text-center">
                        <div className="bg-slate-950/60 p-1.5 rounded">
                          <span className="text-slate-500 block">Skill (40%)</span>
                          <span className="font-bold text-slate-200">{w.scoreBreakdown?.skillScore || 0}%</span>
                        </div>
                        <div className="bg-slate-950/60 p-1.5 rounded">
                          <span className="text-slate-500 block">Avail (25%)</span>
                          <span className="font-bold text-slate-200">{w.scoreBreakdown?.availScore || 0}%</span>
                        </div>
                        <div className="bg-slate-950/60 p-1.5 rounded">
                          <span className="text-slate-500 block">Travel (15%)</span>
                          <span className="font-bold text-slate-200">{w.scoreBreakdown?.distanceScore || 0}%</span>
                        </div>
                        <div className="bg-slate-950/60 p-1.5 rounded">
                          <span className="text-slate-500 block">Workload (10%)</span>
                          <span className="font-bold text-slate-200">{w.scoreBreakdown?.workloadScore || 0}%</span>
                        </div>
                        <div className="bg-slate-950/60 p-1.5 rounded">
                          <span className="text-slate-500 block">Rating (10%)</span>
                          <span className="font-bold text-slate-200">{w.scoreBreakdown?.performanceScore || 0}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Admin Approval Actions & Scheduling Engine */}
        <div className="space-y-6">
          
          {/* Scheduling & Approval Controls */}
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/40 space-y-5 shadow-2xl sticky top-24">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>Smart Scheduling & Approval</span>
            </h3>

            {/* Selected Worker Info */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Selected Worker</span>
              <div className="text-sm font-bold text-white mt-0.5">
                {workerRanking?.rankedWorkers?.find(w => w.workerId === selectedWorkerId)?.workerName || (workerRanking?.rankedWorkers?.length > 0 ? workerRanking.rankedWorkers[0].workerName : 'No workers available')}
              </div>
            </div>

            {/* Time Slot Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Recommended Appointment Slot</label>
              <div className="space-y-2">
                {scheduleSlots?.recommendedSlot && (
                  <button
                    type="button"
                    onClick={() => setSelectedTime(scheduleSlots.recommendedSlot.startTimeFormatted)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      selectedTime === scheduleSlots.recommendedSlot.startTimeFormatted
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>⭐ Recommended: {scheduleSlots.recommendedSlot.label}</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  </button>
                )}

                {scheduleSlots?.alternativeSlots?.map((slot, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedTime(slot.startTimeFormatted)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      selectedTime === slot.startTimeFormatted
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>Alternative: {slot.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Approval CTA */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleApproveAssignment(null)}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/30 text-xs flex items-center justify-center space-x-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept AI Recommendation</span>
              </button>

              <button
                onClick={() => handleApproveAssignment(selectedWorkerId)}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-2xl text-xs flex items-center justify-center space-x-2 transition-colors border border-slate-700"
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Manual Override Selection</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
