import React from 'react';
import { CheckCircle2, Clock, Bot, UserCheck, Calendar, Truck, Wrench, CheckCheck } from 'lucide-react';

const steps = [
  { id: 'PENDING', label: 'Submitted', icon: Clock },
  { id: 'AI_ANALYZED', label: 'AI Analyzed', icon: Bot },
  { id: 'ASSIGNED', label: 'Assigned', icon: UserCheck },
  { id: 'SCHEDULED', label: 'Scheduled', icon: Calendar },
  { id: 'WORKER_ON_WAY', label: 'On Way', icon: Truck },
  { id: 'IN_PROGRESS', label: 'In Progress', icon: Wrench },
  { id: 'COMPLETED', label: 'Completed', icon: CheckCheck }
];

const statusOrder = {
  PENDING: 1,
  AI_ANALYZED: 2,
  ASSIGNMENT_PENDING: 2,
  ASSIGNED: 3,
  SCHEDULED: 4,
  WORKER_ON_WAY: 5,
  IN_PROGRESS: 6,
  COMPLETED: 7,
  CANCELLED: -1
};

export default function Timeline({ currentStatus }) {
  const currentStepIndex = statusOrder[currentStatus] || 1;

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-center justify-center space-x-2">
        <span>This maintenance request has been cancelled.</span>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        {/* Connection Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full z-0" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full z-0 transition-all duration-500"
          style={{ width: `${((Math.max(1, currentStepIndex) - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = currentStepIndex > stepNum || currentStatus === 'COMPLETED';
          const isCurrent = currentStepIndex === stepNum && currentStatus !== 'COMPLETED';
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDone 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : isCurrent 
                    ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20 animate-pulse' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-[11px] font-medium mt-2 transition-colors ${
                isCurrent ? 'text-indigo-400 font-semibold' : isDone ? 'text-slate-200' : 'text-slate-500'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
