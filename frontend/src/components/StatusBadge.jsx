import React from 'react';

const statusConfig = {
  PENDING: { label: 'Pending', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  AI_ANALYZED: { label: 'AI Analyzed', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  ASSIGNMENT_PENDING: { label: 'Matching Worker', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  ASSIGNED: { label: 'Worker Assigned', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  SCHEDULED: { label: 'Scheduled', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  WORKER_ON_WAY: { label: 'Worker On The Way', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
  COMPLETED: { label: 'Completed', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-500/10 text-red-400 border-red-500/30' },
  REASSIGNED: { label: 'Reassigned', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, bg: 'bg-slate-700 text-slate-300 border-slate-600' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
      {config.label}
    </span>
  );
}
