import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Shield, Bot, User, Wrench, Calendar, Clock, MapPin, CheckCircle2, 
  AlertTriangle, ArrowLeft, RefreshCw, Star, Edit3, XCircle,
  CheckCheck, FileText, Phone, Award, BarChart3, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { requestAPI, workerAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import RatingModal from '../components/RatingModal';

export default function AdminRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

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
    return <div className="max-w-7xl mx-auto p-8 text-center text-slate-gray font-medium">Loading detail data...</div>;
  }

  if (!detailData || !detailData.request) {
    return <div className="max-w-7xl mx-auto p-8 text-center text-semantic-error font-semibold">Request not found</div>;
  }

  const { request, assignment, schedule, rating, workerRanking, scheduleSlots } = detailData;
  const recommendedWorker = workerRanking?.recommendedWorker;
  const isCompleted = request.status === 'COMPLETED';
  const isAdmin = user?.role === 'ADMIN';
  const isResident = user?.role === 'RESIDENT';

  const calculateResolutionTime = () => {
    if (!request.created_at || !request.updated_at) return `${request.estimated_duration || 45} mins`;
    const created = new Date(request.created_at).getTime();
    const updated = new Date(request.updated_at).getTime();
    const diffMins = Math.round((updated - created) / 60000);
    if (diffMins <= 0) return `${request.estimated_duration || 45} mins`;
    if (diffMins < 60) return `${diffMins} mins`;
    const hours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const formatSkills = (skills) => {
    if (!skills) return request.required_skill || 'General';
    if (Array.isArray(skills)) return skills.join(', ');
    try {
      const parsed = JSON.parse(skills);
      if (Array.isArray(parsed)) return parsed.join(', ');
    } catch (e) {}
    return String(skills);
  };

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
      alert(err.response?.data?.error || 'Failed to approve assignment');
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
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-gray hover:text-navy-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-3">
          <StatusBadge status={request.status} />
          <span className="text-xs font-mono font-bold text-navy-primary bg-slate-100 px-2.5 py-1 rounded-lg border border-theme-border">
            Ticket #{request.ticket_code}
          </span>
        </div>
      </div>

      {/* Visual Request Timeline */}
      <div className="bg-white p-6 rounded-3xl border border-theme-border shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-gray mb-2">Request Lifecycle Timeline</h3>
        <Timeline currentStatus={request.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Complaint & AI Analysis */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Complaint Card */}
          <div className="bg-white p-6 rounded-3xl border border-theme-border shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-teal-primary bg-teal-50 px-2.5 py-0.5 rounded border border-teal-100">
                  {request.category} • {request.subcategory}
                </span>
                <h2 className="text-xl font-bold text-navy-primary mt-2">{request.description}</h2>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                request.priority === 'HIGH' ? 'bg-red-50 text-semantic-error border border-red-200' : 
                request.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {request.priority} Priority
              </span>
            </div>

            {/* Resident Information */}
            <div className="p-4 rounded-2xl bg-[#F7F9F8] border border-theme-border grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-gray block">Resident Name</span>
                <span className="font-semibold text-charcoal">{request.resident_name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-gray block">Apartment Flat</span>
                <span className="font-semibold text-charcoal">{request.block} • Flat {request.flat_number}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-gray block">Phone Contact</span>
                <span className="font-semibold text-charcoal">{request.resident_phone || '+91 98765 43210'}</span>
              </div>
            </div>
          </div>

          {/* AI Analysis Panel */}
          <div className="bg-white p-6 rounded-3xl border border-teal-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
                  <Bot className="w-4 h-4 text-teal-primary" />
                </div>
                <h3 className="text-base font-bold text-navy-primary">AI Complaint Understanding</h3>
              </div>
              <span className="text-xs text-teal-primary font-extrabold bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                {request.ai_confidence || 94}% Confidence
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F7F9F8] border border-theme-border">
                <span className="text-[10px] text-slate-gray uppercase font-bold block">Trade Skill</span>
                <span className="font-bold text-teal-primary">{request.required_skill}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F9F8] border border-theme-border">
                <span className="text-[10px] text-slate-gray uppercase font-bold block">Estimated Duration</span>
                <span className="font-bold text-navy-primary">{request.estimated_duration || 45} mins</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F9F8] border border-theme-border">
                <span className="text-[10px] text-slate-gray uppercase font-bold block">Subcategory</span>
                <span className="font-bold text-charcoal">{request.subcategory}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F9F8] border border-theme-border">
                <span className="text-[10px] text-slate-gray uppercase font-bold block">Priority Rating</span>
                <span className="font-bold text-amber-600">{request.priority}</span>
              </div>
            </div>

            <div className="text-xs text-navy-primary bg-teal-50/60 p-3.5 rounded-xl border border-teal-100 leading-relaxed">
              <strong className="text-teal-primary font-semibold">AI Diagnostic Reason: </strong> "{request.ai_reason}"
            </div>
          </div>

          {/* SECTION A: WHEN COMPLETED -> SHOW SERVICE COMPLETION ANALYTICS */}
          {isCompleted && (
            <div className="bg-white p-6 rounded-3xl border border-theme-border shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-theme-border pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
                    <BarChart3 className="w-4 h-4 text-teal-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-primary">Service Completion Analytics</h3>
                    <p className="text-xs text-slate-gray">Comprehensive resolution and performance metrics</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Work Completed</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#F7F9F8] p-3.5 rounded-xl border border-theme-border">
                  <span className="text-[10px] text-slate-gray uppercase font-bold block">Serviced By</span>
                  <span className="font-bold text-navy-primary text-sm block mt-0.5">
                    {assignment?.worker_name || 'Assigned Technician'}
                  </span>
                  <span className="text-[10px] text-slate-gray block">
                    {formatSkills(assignment?.worker_skills)}
                  </span>
                </div>

                <div className="bg-[#F7F9F8] p-3.5 rounded-xl border border-theme-border">
                  <span className="text-[10px] text-slate-gray uppercase font-bold block">AI Match Score</span>
                  <span className="font-bold text-teal-primary text-sm block mt-0.5">
                    {assignment?.match_score || 96}% Match
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">Optimal Dispatch</span>
                </div>

                <div className="bg-[#F7F9F8] p-3.5 rounded-xl border border-theme-border">
                  <span className="text-[10px] text-slate-gray uppercase font-bold block">Resolution Time</span>
                  <span className="font-bold text-navy-primary text-sm block mt-0.5">
                    {calculateResolutionTime()}
                  </span>
                  <span className="text-[10px] text-slate-gray block">
                    Est: {request.estimated_duration || 45} mins
                  </span>
                </div>

                <div className="bg-[#F7F9F8] p-3.5 rounded-xl border border-theme-border">
                  <span className="text-[10px] text-slate-gray uppercase font-bold block">Scheduled Slot</span>
                  <span className="font-bold text-charcoal text-sm block mt-0.5">
                    {schedule?.start_time || '10:00 AM'} – {schedule?.end_time || '10:45 AM'}
                  </span>
                  <span className="text-[10px] text-slate-gray block">{schedule?.scheduled_date || 'Today'}</span>
                </div>
              </div>

              {/* Service Execution Verification Bars */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-bold text-slate-gray uppercase tracking-wider block">Service Execution Scores</span>
                
                <div className="grid grid-cols-3 gap-3 text-[11px]">
                  <div className="bg-[#F7F9F8] p-3 rounded-xl border border-theme-border/60 space-y-1.5">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-gray">Skill Match</span>
                      <span className="text-navy-primary font-bold">100%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-primary h-full rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div className="bg-[#F7F9F8] p-3 rounded-xl border border-theme-border/60 space-y-1.5">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-gray">Schedule Adherence</span>
                      <span className="text-navy-primary font-bold">100%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-primary h-full rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div className="bg-[#F7F9F8] p-3 rounded-xl border border-theme-border/60 space-y-1.5">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-gray">AI Diagnostic Match</span>
                      <span className="text-navy-primary font-bold">{request.ai_confidence || 94}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-primary h-full rounded-full" style={{ width: `${request.ai_confidence || 94}%` }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* SECTION B: WHEN NOT COMPLETED & ADMIN -> SHOW MULTI-CRITERIA WORKER RANKING ENGINE */}
          {!isCompleted && isAdmin && (
            <div className="bg-white p-6 rounded-3xl border border-theme-border shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="text-base font-bold text-navy-primary">
                  Multi-Criteria Worker Ranking Engine
                </h3>
                <span className="text-[11px] font-mono text-slate-gray">
                  Weights: 40% Skill + 25% Avail + 15% Travel + 10% Workload + 10% Rating
                </span>
              </div>

              {(!workerRanking || !workerRanking.rankedWorkers || workerRanking.rankedWorkers.length === 0) ? (
                <div className="p-8 text-center rounded-2xl bg-[#F7F9F8] border border-theme-border">
                  <p className="text-sm font-semibold text-charcoal">No workers available for assignment.</p>
                  <p className="text-xs text-slate-gray mt-1">Please register or activate staff in the Worker Management tab.</p>
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
                            ? 'bg-teal-50/40 border-teal-primary shadow-sm' 
                            : 'bg-white border-theme-border hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isTop ? 'bg-teal-primary text-white font-extrabold' : 'bg-slate-100 text-slate-gray'
                            }`}>
                              #{idx + 1}
                            </div>

                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-bold text-navy-primary">{w.workerName}</h4>
                                {isTop && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-primary border border-teal-200">
                                    Top Recommendation
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-gray flex items-center space-x-2.5 mt-0.5">
                                <span>Skills: {w.skills?.join(', ') || 'General'}</span>
                                <span>•</span>
                                <span className="text-amber-500 font-medium flex items-center">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                                  {w.rating}★
                                </span>
                                <span>•</span>
                                <span className={w.availability === 'Available' ? 'text-semantic-success font-semibold' : 'text-amber-600 font-semibold'}>
                                  {w.availability}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xl font-extrabold text-teal-primary">{w.matchScore}%</div>
                            <span className="text-[10px] text-slate-gray font-medium block">Match Score</span>
                          </div>
                        </div>

                        {/* Clean Teal Score Metric Breakdown Bars */}
                        <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t border-theme-border/60 text-[10px]">
                          <div className="bg-[#F7F9F8] p-2 rounded-lg border border-theme-border/50">
                            <div className="flex justify-between text-slate-gray mb-1">
                              <span className="font-medium">Skill (40%)</span>
                              <span className="font-bold text-navy-primary">{w.scoreBreakdown?.skillScore || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-teal-primary h-full rounded-full transition-all" style={{ width: `${w.scoreBreakdown?.skillScore || 0}%` }} />
                            </div>
                          </div>

                          <div className="bg-[#F7F9F8] p-2 rounded-lg border border-theme-border/50">
                            <div className="flex justify-between text-slate-gray mb-1">
                              <span className="font-medium">Avail (25%)</span>
                              <span className="font-bold text-navy-primary">{w.scoreBreakdown?.availScore || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-teal-primary h-full rounded-full transition-all" style={{ width: `${w.scoreBreakdown?.availScore || 0}%` }} />
                            </div>
                          </div>

                          <div className="bg-[#F7F9F8] p-2 rounded-lg border border-theme-border/50">
                            <div className="flex justify-between text-slate-gray mb-1">
                              <span className="font-medium">Travel (15%)</span>
                              <span className="font-bold text-navy-primary">{w.scoreBreakdown?.distanceScore || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-teal-primary h-full rounded-full transition-all" style={{ width: `${w.scoreBreakdown?.distanceScore || 0}%` }} />
                            </div>
                          </div>

                          <div className="bg-[#F7F9F8] p-2 rounded-lg border border-theme-border/50">
                            <div className="flex justify-between text-slate-gray mb-1">
                              <span className="font-medium">Workload (10%)</span>
                              <span className="font-bold text-navy-primary">{w.scoreBreakdown?.workloadScore || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-teal-primary h-full rounded-full transition-all" style={{ width: `${w.scoreBreakdown?.workloadScore || 0}%` }} />
                            </div>
                          </div>

                          <div className="bg-[#F7F9F8] p-2 rounded-lg border border-theme-border/50">
                            <div className="flex justify-between text-slate-gray mb-1">
                              <span className="font-medium">Rating (10%)</span>
                              <span className="font-bold text-navy-primary">{w.scoreBreakdown?.performanceScore || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-teal-primary h-full rounded-full transition-all" style={{ width: `${w.scoreBreakdown?.performanceScore || 0}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Dynamic Status & Actions */}
        <div className="space-y-6">
          
          {/* CASE 1: TASK IS COMPLETED -> SHOW COMPLETION BANNER, WORKER NOTES & RATING */}
          {isCompleted ? (
            <div className="space-y-5 sticky top-24">
              
              {/* Work Completed Successfully Card */}
              <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-sm space-y-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                    <CheckCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-navy-primary">Work Completed Successfully</h3>
                    <p className="text-xs text-slate-gray mt-0.5">Task resolved & verified on premises</p>
                  </div>
                </div>

                <div className="bg-[#F7F9F8] p-3.5 rounded-2xl border border-theme-border space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-gray">Current Status:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      COMPLETED
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-gray">Completed On:</span>
                    <span className="font-semibold text-charcoal">
                      {request.updated_at ? new Date(request.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-gray">Assigned Worker:</span>
                    <span className="font-semibold text-navy-primary">{assignment?.worker_name || 'Staff Specialist'}</span>
                  </div>
                </div>
              </div>

              {/* Worker Completion Notes Card */}
              <div className="bg-white p-6 rounded-3xl border border-theme-border shadow-sm space-y-3">
                <div className="flex items-center space-x-2 border-b border-theme-border pb-3">
                  <FileText className="w-4 h-4 text-teal-primary" />
                  <h4 className="text-sm font-bold text-navy-primary">Worker Completion Notes</h4>
                </div>

                <div className="bg-[#F7F9F8] p-4 rounded-xl border border-theme-border space-y-2">
                  <span className="text-[10px] text-slate-gray uppercase font-bold tracking-wider block">
                    Notes entered upon completion:
                  </span>
                  <p className="text-sm font-medium text-charcoal leading-relaxed">
                    "{request.notes || 'Work completed cleanly and tested for full operation.'}"
                  </p>
                  <div className="pt-2 border-t border-theme-border/60 flex items-center justify-between text-xs text-slate-gray">
                    <span>Technician: <strong className="text-navy-primary">{assignment?.worker_name || 'Technician'}</strong></span>
                    {assignment?.worker_phone && (
                      <a href={`tel:${assignment.worker_phone}`} className="text-teal-primary font-semibold hover:underline flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Rating & Feedback Card */}
              <div className="bg-white p-6 rounded-3xl border border-theme-border shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-theme-border pb-3">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <h4 className="text-sm font-bold text-navy-primary">Resident Service Review</h4>
                  </div>
                  {rating && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {rating.rating} / 5.0 ★
                    </span>
                  )}
                </div>

                {rating ? (
                  <div className="bg-[#F7F9F8] p-4 rounded-xl border border-theme-border space-y-2 text-xs">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${star <= rating.rating ? 'text-amber-500 fill-amber-400' : 'text-slate-300'}`} 
                        />
                      ))}
                    </div>
                    <p className="text-charcoal italic">
                      "{rating.feedback || 'Great job, repair solved the issue completely.'}"
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold block pt-1">
                      ✓ Verified Resident Rating
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3 text-center py-2">
                    <p className="text-xs text-slate-gray">
                      {isResident 
                        ? 'Please rate the technician and quality of work to help us maintain service standards.' 
                        : 'No rating has been submitted by the resident yet.'}
                    </p>
                    {isResident && (
                      <button
                        onClick={() => setIsRatingModalOpen(true)}
                        className="w-full py-2.5 bg-teal-primary hover:bg-[#13887B] text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center space-x-1.5"
                      >
                        <Star className="w-4 h-4 fill-white" />
                        <span>Rate Service & Technician</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          ) : isAdmin ? (
            /* CASE 2: NOT COMPLETED & ADMIN -> SHOW SMART SCHEDULING & APPROVAL CONTROLS */
            <div className="bg-white p-6 rounded-3xl border border-theme-border space-y-5 shadow-sm sticky top-24">
              <h3 className="text-base font-bold text-navy-primary flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-teal-primary" />
                <span>Smart Scheduling & Approval</span>
              </h3>

              {/* Selected Worker Info */}
              <div className="p-3.5 rounded-2xl bg-[#F7F9F8] border border-theme-border">
                <span className="text-[10px] text-slate-gray uppercase font-bold block">Selected Worker</span>
                <div className="text-sm font-bold text-navy-primary mt-0.5">
                  {workerRanking?.rankedWorkers?.find(w => w.workerId === selectedWorkerId)?.workerName || (workerRanking?.rankedWorkers?.length > 0 ? workerRanking.rankedWorkers[0].workerName : 'No workers available')}
                </div>
              </div>

              {/* Time Slot Picker */}
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">Recommended Appointment Slot</label>
                <div className="space-y-2">
                  {scheduleSlots?.recommendedSlot && (
                    <button
                      type="button"
                      onClick={() => setSelectedTime(scheduleSlots.recommendedSlot.startTimeFormatted)}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        selectedTime === scheduleSlots.recommendedSlot.startTimeFormatted
                          ? 'bg-teal-50 border-teal-primary text-navy-primary font-bold shadow-xs'
                          : 'bg-white border-theme-border text-slate-gray hover:border-slate-300'
                      }`}
                    >
                      <span>⭐ Recommended: {scheduleSlots.recommendedSlot.label}</span>
                      <CheckCircle2 className="w-4 h-4 text-teal-primary" />
                    </button>
                  )}

                  {scheduleSlots?.alternativeSlots?.map((slot, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedTime(slot.startTimeFormatted)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        selectedTime === slot.startTimeFormatted
                          ? 'bg-teal-50/50 border-teal-primary text-navy-primary font-bold'
                          : 'bg-white border-theme-border text-charcoal hover:border-slate-300'
                      }`}
                    >
                      <span>Alternative: {slot.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Approval CTA */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => handleApproveAssignment(null)}
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-teal-primary hover:bg-[#13887B] text-white font-bold rounded-2xl shadow-sm text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept AI Recommendation</span>
                </button>

                <button
                  onClick={() => handleApproveAssignment(selectedWorkerId)}
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 text-charcoal font-semibold rounded-2xl text-xs flex items-center justify-center space-x-2 transition-colors border border-theme-border disabled:opacity-60"
                >
                  <Edit3 className="w-4 h-4 text-slate-gray" />
                  <span>Manual Override Selection</span>
                </button>
              </div>

            </div>
          ) : (
            /* CASE 3: NOT COMPLETED & RESIDENT -> SHOW ASSIGNED TECHNICIAN & APPOINTMENT STATUS */
            <div className="bg-white p-6 rounded-3xl border border-theme-border space-y-5 shadow-sm sticky top-24">
              <h3 className="text-base font-bold text-navy-primary flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-teal-primary" />
                <span>Assigned Technician & Schedule</span>
              </h3>

              <div className="p-4 rounded-2xl bg-[#F7F9F8] border border-theme-border space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-gray uppercase font-bold block">Assigned Staff</span>
                  <span className="text-sm font-bold text-navy-primary block mt-0.5">
                    {assignment?.worker_name || 'Technician Assigned'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-theme-border/60">
                  <span className="text-slate-gray">Scheduled Slot:</span>
                  <span className="font-semibold text-charcoal">
                    {schedule?.start_time ? `${schedule.start_time} – ${schedule.end_time}` : (request.preferred_time || '10:00 AM')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-gray">Appointment Date:</span>
                  <span className="font-semibold text-charcoal">
                    {schedule?.scheduled_date || request.preferred_date || 'Today'}
                  </span>
                </div>

                {assignment?.worker_phone && (
                  <div className="pt-2 border-t border-theme-border/60">
                    <a 
                      href={`tel:${assignment.worker_phone}`} 
                      className="w-full py-2 bg-white hover:bg-slate-50 border border-theme-border text-teal-primary font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Worker: {assignment.worker_phone}</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-100 text-xs text-navy-primary flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-teal-primary shrink-0" />
                <span>Maintenance request is actively being coordinated by the facilities desk.</span>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Rating Modal for Resident */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        request={request}
        onRatingSubmitted={() => {
          fetchDetail();
          setIsRatingModalOpen(false);
        }}
      />

    </div>
  );
}
