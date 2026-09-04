import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, CheckCircle2, Clock, Star, Bot, Building2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { analyticsAPI } from '../services/api';

const COLORS = ['#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getMetrics()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="max-w-7xl mx-auto p-8 text-center text-slate-500">Loading analytics metrics...</div>;
  }

  const { summary, byCategory, byBlock, byPriority, workerUtilization } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-extrabold text-white">Community Analytics & AI Performance</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Real-time maintenance metrics across Blocks A–F</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-blue-500/20">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Requests</span>
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{summary.totalRequests || 0}</div>
          <span className="text-[10px] text-blue-400 mt-1 block">
            {summary.pendingRequests || 0} active / {summary.completedRequests || 0} resolved
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-cyan-500/20">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Resolution Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {summary.totalRequests > 0 ? `${summary.avgResolutionTimeMinutes} mins` : '—'}
          </div>
          <span className="text-[10px] text-cyan-400 mt-1 block">
            {summary.totalRequests > 0 ? 'From submission to fix' : 'No completed jobs yet'}
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-emerald-500/20">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Resident Satisfaction</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {summary.totalRequests > 0 ? `${summary.satisfactionScore} / 5.0` : '—'}
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 block">
            {summary.totalRequests > 0 ? 'Verified resident reviews' : 'No ratings recorded yet'}
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-purple-500/20">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{summary.completionRate || 0}%</div>
          <span className="text-[10px] text-purple-400 mt-1 block">
            {summary.totalRequests > 0 ? 'Resolved requests ratio' : 'No requests logged yet'}
          </span>
        </div>
      </div>

      {summary.totalRequests === 0 && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800 text-center">
          <p className="text-sm font-semibold text-slate-300">No data available yet.</p>
          <p className="text-xs text-slate-500 mt-1">
            Charts and community performance breakdown will populate automatically as maintenance requests are logged and resolved.
          </p>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Requests by Category */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Requests by Maintenance Category</h3>
          <div className="h-64 flex items-center justify-center">
            {(!byCategory || byCategory.length === 0) ? (
              <span className="text-xs text-slate-500 font-medium">No data available yet.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Requests by Apartment Block */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Requests Across Apartment Blocks</h3>
          <div className="h-64 flex items-center justify-center">
            {(!byBlock || byBlock.length === 0) ? (
              <span className="text-xs text-slate-500 font-medium">No data available yet.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byBlock}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="block" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Worker Utilization */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Worker Utilization & Job Completions</h3>
          <div className="h-64 flex items-center justify-center">
            {(!workerUtilization || workerUtilization.length === 0) ? (
              <span className="text-xs text-slate-500 font-medium">No data available yet.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workerUtilization} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="completed_jobs" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Complaint Urgency Priority Breakdown</h3>
          <div className="h-64 flex items-center justify-center">
            {(!byPriority || byPriority.length === 0) ? (
              <span className="text-xs text-slate-500 font-medium">No data available yet.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byPriority}
                    dataKey="count"
                    nameKey="priority"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ priority, count }) => `${priority}: ${count}`}
                  >
                    {byPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
