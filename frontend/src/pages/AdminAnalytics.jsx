import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, CheckCircle2, Clock, Star, Bot, Building2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { analyticsAPI } from '../services/api';

const COLORS = ['#18A999', '#12304A', '#22A06B', '#E8A317', '#D64545', '#667085', '#0F6B61'];

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
    return <div className="max-w-7xl mx-auto p-8 text-center text-slate-gray font-medium">Loading analytics metrics...</div>;
  }

  const { summary, byCategory, byBlock, byPriority, workerUtilization } = data;

  const tooltipStyle = {
    backgroundColor: '#FFFFFF',
    borderColor: '#E4E9ED',
    borderRadius: '12px',
    color: '#17212B',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    fontSize: '12px'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-navy-primary/5 flex items-center justify-center border border-navy-primary/10">
            <BarChart2 className="w-5 h-5 text-navy-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-navy-primary tracking-tight">Community Analytics & AI Performance</h1>
        </div>
        <p className="text-xs text-slate-gray mt-1 font-medium">Real-time maintenance metrics across residential blocks</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-theme-border shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-gray font-medium">
            <span>Total Requests</span>
            <Bot className="w-4 h-4 text-teal-primary" />
          </div>
          <div className="text-3xl font-extrabold text-navy-primary mt-2">{summary.totalRequests || 0}</div>
          <span className="text-[10px] text-teal-primary mt-1 block font-semibold">
            {summary.pendingRequests || 0} active / {summary.completedRequests || 0} resolved
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-theme-border shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-gray font-medium">
            <span>Avg Resolution Time</span>
            <Clock className="w-4 h-4 text-teal-primary" />
          </div>
          <div className="text-3xl font-extrabold text-navy-primary mt-2">
            {summary.totalRequests > 0 ? `${summary.avgResolutionTimeMinutes} mins` : '—'}
          </div>
          <span className="text-[10px] text-slate-gray mt-1 block font-medium">
            {summary.totalRequests > 0 ? 'From submission to fix' : 'No completed jobs yet'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-theme-border shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-gray font-medium">
            <span>Resident Satisfaction</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-navy-primary mt-2">
            {summary.totalRequests > 0 ? `${summary.satisfactionScore} / 5.0` : '—'}
          </div>
          <span className="text-[10px] text-semantic-success mt-1 block font-semibold">
            {summary.totalRequests > 0 ? 'Verified resident reviews' : 'No ratings recorded yet'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-theme-border shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-gray font-medium">
            <span>Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-semantic-success" />
          </div>
          <div className="text-3xl font-extrabold text-navy-primary mt-2">{summary.completionRate || 0}%</div>
          <span className="text-[10px] text-slate-gray mt-1 block font-medium">
            {summary.totalRequests > 0 ? 'Resolved requests ratio' : 'No requests logged yet'}
          </span>
        </div>
      </div>

      {summary.totalRequests === 0 && (
        <div className="bg-white p-6 rounded-3xl border border-theme-border text-center shadow-sm">
          <p className="text-sm font-semibold text-charcoal">No data available yet.</p>
          <p className="text-xs text-slate-gray mt-1">
            Charts and community performance breakdown will populate automatically as maintenance requests are logged and resolved.
          </p>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Requests by Category */}
        <div className="bg-white p-6 rounded-3xl border border-theme-border space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-navy-primary">Requests by Maintenance Category</h3>
          <div className="h-64 flex items-center justify-center">
            {(!byCategory || byCategory.length === 0) ? (
              <span className="text-xs text-slate-gray font-medium">No data available yet.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E9ED" />
                  <XAxis dataKey="category" stroke="#667085" fontSize={11} />
                  <YAxis stroke="#667085" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#18A999" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Requests by Apartment Block */}
        <div className="bg-white p-6 rounded-3xl border border-theme-border space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-navy-primary">Requests Across Apartment Blocks</h3>
          <div className="h-64 flex items-center justify-center">
            {(!byBlock || byBlock.length === 0) ? (
              <span className="text-xs text-slate-gray font-medium">No data available yet.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byBlock}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E9ED" />
                  <XAxis dataKey="block" stroke="#667085" fontSize={11} />
                  <YAxis stroke="#667085" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#12304A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Worker Utilization */}
        <div className="bg-white p-6 rounded-3xl border border-theme-border space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-navy-primary">Worker Utilization & Job Completions</h3>
          <div className="h-64 flex items-center justify-center">
            {(!workerUtilization || workerUtilization.length === 0) ? (
              <span className="text-xs text-slate-gray font-medium">No data available yet.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workerUtilization} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E9ED" />
                  <XAxis type="number" stroke="#667085" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#667085" fontSize={11} width={100} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="completed_jobs" fill="#22A06B" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-theme-border space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-navy-primary">Complaint Urgency Priority Breakdown</h3>
          <div className="h-64 flex items-center justify-center">
            {(!byPriority || byPriority.length === 0) ? (
              <span className="text-xs text-slate-gray font-medium">No data available yet.</span>
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
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
