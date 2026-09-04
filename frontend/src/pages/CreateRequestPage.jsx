import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, CheckCircle2, ArrowRight, Calendar, Clock, MapPin, AlertCircle, Wrench, RefreshCw, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { requestAPI, blockAPI } from '../services/api';

export default function CreateRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [block, setBlock] = useState(user?.block || '');
  const [flatNumber, setFlatNumber] = useState(user?.flat_number || '');
  const [preferredDate, setPreferredDate] = useState('Today');
  const [preferredTime, setPreferredTime] = useState('10:00 AM');
  const [notes, setNotes] = useState('');
  const [blocks, setBlocks] = useState([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  const stepsList = [
    'Understanding problem description',
    'Identifying maintenance category',
    'Estimating priority & urgency level',
    'Identifying required worker trade skill',
    'Estimating repair duration',
    'Finding suitable worker & computing match score',
    'Checking available non-overlapping time slots'
  ];

  useEffect(() => {
    blockAPI.getBlocks()
      .then(res => {
        setBlocks(res.data);
        if (!block && res.data.length > 0) {
          setBlock(user?.block || res.data[0].name);
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please provide a description of the maintenance issue.');
      return;
    }

    if (!block.trim() || !flatNumber.trim()) {
      setError('Apartment block and flat number are required.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Progressive step indicator for transparent AI workflow
    for (let i = 0; i < stepsList.length; i++) {
      await new Promise(r => setTimeout(r, 180));
      setAnalysisStep(i + 1);
    }

    try {
      const res = await requestAPI.create({
        description: description.trim(),
        block: block.trim(),
        flat_number: flatNumber.trim(),
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        notes: notes.trim() || null
      });

      setAnalysisResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Report a Problem</h1>
        <p className="text-slate-400 text-sm mt-1">
          Describe the maintenance problem in natural language. Our AI will analyze the category, estimate repair duration, and find suitable available workers.
        </p>
      </div>

      {!isAnalyzing && !analysisResult ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Main Input: Problem Description */}
          <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Problem Description *</span>
              </label>
              <span className="text-[11px] text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded">
                AI Diagnostic Ready
              </span>
            </div>

            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in your own words (e.g. The bathroom tap has been leaking continuously since yesterday causing water pooling on the floor...)"
              className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-base leading-relaxed"
            />
          </div>

          {/* Location & Timing Preferences Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Location & Timing Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Apartment Block *</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
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
                <label className="block text-xs font-semibold text-slate-400 mb-1">Flat Number *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. C-304"
                    value={flatNumber}
                    onChange={(e) => setFlatNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Preferred Date</label>
                <select
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Today">Today</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="This Weekend">This Weekend</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Preferred Time Window</label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="10:00 AM">Morning (10:00 AM)</option>
                  <option value="02:00 PM">Afternoon (02:00 PM)</option>
                  <option value="05:00 PM">Evening (05:00 PM)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Additional Instructions (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please call before arriving or ring doorbell"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-2 text-base transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5" />
            <span>Submit Request & Run AI Diagnostics</span>
          </button>
        </form>
      ) : isAnalyzing && !analysisResult ? (
        
        /* Live AI Processing Screen */
        <div className="glass-panel p-8 rounded-3xl border border-indigo-500/40 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30 animate-spin">
            <RefreshCw className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">HomeSync AI is analyzing your request...</h2>
            <p className="text-xs text-slate-400 mt-1">Executing natural language symptom extraction and multi-criteria worker matching</p>
          </div>

          <div className="max-w-md mx-auto space-y-2.5 text-left bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            {stepsList.map((stepText, idx) => {
              const isStepDone = analysisStep > idx;
              const isStepActive = analysisStep === idx;

              return (
                <div key={idx} className="flex items-center space-x-3 text-xs">
                  {isStepDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isStepActive ? (
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 shrink-0" />
                  )}
                  <span className={isStepDone ? 'text-slate-200 font-medium' : isStepActive ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
                    {stepText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      ) : (

        /* Analysis Result & Appointment Confirmation Screen */
        <div className="space-y-6 animate-in fade-in-50">
          
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">Maintenance Request Registered</h2>
                  <p className="text-xs font-mono text-emerald-400">
                    Ticket #{analysisResult.request.ticket_code} • {analysisResult.request.block}, Flat {analysisResult.request.flat_number}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {analysisResult.aiAnalysis.confidence}% AI Diagnostic Confidence
              </span>
            </div>

            {/* AI Diagnosis Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Category</span>
                <span className="text-sm font-bold text-blue-400">{analysisResult.aiAnalysis.category}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Subcategory</span>
                <span className="text-sm font-bold text-white">{analysisResult.aiAnalysis.subcategory}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Priority</span>
                <span className="text-sm font-bold text-amber-400">{analysisResult.aiAnalysis.priority}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Estimated Duration</span>
                <span className="text-sm font-bold text-purple-400">{analysisResult.aiAnalysis.estimatedDuration} mins</span>
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 leading-relaxed">
              <span className="font-bold block text-blue-200 mb-1">Diagnostic Explanation:</span>
              "{analysisResult.aiAnalysis.reason}"
            </div>

            {/* Smart Recommended Worker or Pending Dispatch Banner */}
            {analysisResult.ranking?.recommendedWorker ? (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/50 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">Smart Worker Assignment</span>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-base font-bold text-white">{analysisResult.ranking.recommendedWorker.workerName}</h3>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {analysisResult.ranking.recommendedWorker.matchScore}% Match Score
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Scheduled Slot: <strong>{analysisResult.scheduleRecommendation?.recommendedSlot?.label || 'Today: Assigned'}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/resident')}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-1.5 transition-all"
                >
                  <span>Go to Resident Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Request Queued for Assignment</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    No workers available for assignment yet. Your request has been recorded and will be assigned by the administrator.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/resident')}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-1.5 transition-all"
                >
                  <span>Go to Resident Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
