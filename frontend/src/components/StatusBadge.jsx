import React from 'react';

const statusConfig = {
  PENDING: { label: 'Pending', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  AI_ANALYZED: { label: 'AI Analyzed', bg: 'bg-teal-50 text-teal-800 border-teal-200' },
  ASSIGNMENT_PENDING: { label: 'Matching Worker', bg: 'bg-teal-50 text-teal-800 border-teal-200' },
  ASSIGNED: { label: 'Worker Assigned', bg: 'bg-sky-50 text-[#12304A] border-sky-200' },
  SCHEDULED: { label: 'Scheduled', bg: 'bg-teal-50 text-teal-800 border-teal-200' },
  WORKER_ON_WAY: { label: 'Worker On Way', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
  COMPLETED: { label: 'Completed', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-50 text-red-800 border-red-200' },
  REASSIGNED: { label: 'Reassigned', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  HIGH: { label: 'High Priority', bg: 'bg-red-50 text-red-800 border-red-200' },
  EMERGENCY: { label: 'Emergency', bg: 'bg-red-50 text-red-800 border-red-200' },
  MEDIUM: { label: 'Medium Priority', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  LOW: { label: 'Low Priority', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {config.label}
    </span>
  );
}
