import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, ArrowRight, CheckCircle2, ShieldCheck, Zap, Calendar, Users, Star, Award, Building2, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-6 shadow-md">
            <Bot className="w-4 h-4" />
            <span>Autonomous Residential Community Maintenance Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
            HOMESYNC <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-slate-300 mb-4 max-w-3xl mx-auto">
            "Smarter Living. Seamless Maintenance."
          </p>

          <p className="text-base sm:text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-powered complaint understanding, multi-criteria smart worker assignment, and deterministic conflict-free schedule calculation for modern residential communities.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {user ? (
              <Link
                to={user.role === 'ADMIN' ? '/admin' : user.role === 'WORKER' ? '/worker' : '/resident'}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-3 transition-all transform hover:-translate-y-0.5"
              >
                <span>Go to Your Portal ({user.role})</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-3 transition-all transform hover:-translate-y-0.5"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Get Started as Resident</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-2xl border border-slate-700 flex items-center justify-center space-x-3 transition-all"
                >
                  <LogIn className="w-5 h-5 text-blue-400" />
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>

          {/* Workflow Diagram */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl max-w-5xl mx-auto">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-8">
              End-to-End Autonomous Workflow
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-3 font-bold">1</div>
                <h4 className="font-semibold text-sm text-slate-200">Resident Report</h4>
                <p className="text-xs text-slate-400 mt-1">Natural language input</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-indigo-500/30 bg-indigo-500/5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3 font-bold">2</div>
                <h4 className="font-semibold text-sm text-indigo-300">AI Understanding</h4>
                <p className="text-xs text-slate-400 mt-1">Category & priority</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-purple-500/30 bg-purple-500/5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-3 font-bold">3</div>
                <h4 className="font-semibold text-sm text-purple-300">Smart Matching</h4>
                <p className="text-xs text-slate-400 mt-1">5-metric match score</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/30 bg-cyan-500/5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-3 font-bold">4</div>
                <h4 className="font-semibold text-sm text-cyan-300">Smart Scheduling</h4>
                <p className="text-xs text-slate-400 mt-1">Conflict-free slots</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/30 bg-emerald-500/5 col-span-2 md:col-span-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3 font-bold">5</div>
                <h4 className="font-semibold text-sm text-emerald-300">Resolution & Rating</h4>
                <p className="text-xs text-slate-400 mt-1">Worker completion</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Innovation Section */}
      <section className="py-16 bg-slate-900/50 border-t border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white">The Core Innovation</h2>
            <p className="text-slate-400 mt-2">Replacing manual paper logbooks and chaos with transparent multi-criteria AI dispatch.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-8 rounded-2xl border border-blue-500/20">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multi-Criteria Worker Matching</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Instead of blindly assigning the first available person, HomeSync AI calculates a multi-factor match score (0–100%):
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> <span><strong>40% Skill Match</strong> — Primary & secondary trade skills</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> <span><strong>25% Worker Availability</strong> — Real-time active status</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> <span><strong>15% Distance / Travel</strong> — Proximity across apartment blocks</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> <span><strong>10% Workload</strong> — Active pending job queue length</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> <span><strong>10% Historical Performance</strong> — Star rating history</span></li>
              </ul>
            </div>

            <div className="glass-card p-8 rounded-2xl border border-indigo-500/20">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Deterministic Scheduling Engine</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Scheduling is computed mathematically from actual worker operating hours, active job durations, and resident preferences:
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> <span>Prevents double-booking and overlapping schedules</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> <span>Includes travel buffer times between apartment blocks</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> <span>Generates recommended slot + feasible alternative appointment times</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> <span>Allows one-click administrator override whenever required</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
