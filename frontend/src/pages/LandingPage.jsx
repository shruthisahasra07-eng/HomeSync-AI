import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, ArrowRight, CheckCircle2, ShieldCheck, Zap, Calendar, Users, Star, Award, Building2, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F7F9F8] text-[#17212B]">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold mb-6 shadow-subtle">
            <Bot className="w-4 h-4 text-[#18A999]" />
            <span>Autonomous Residential Community Maintenance Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#12304A] mb-4">
            HOME<span className="text-[#18A999]">SYNC</span> <span className="text-[#18A999]">AI</span>
          </h1>

          <p className="text-xl sm:text-2xl font-semibold text-[#12304A] mb-4 max-w-3xl mx-auto">
            "Smarter Living. Seamless Maintenance."
          </p>

          <p className="text-base sm:text-lg text-[#667085] mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-powered complaint understanding, multi-criteria smart worker assignment, and deterministic conflict-free schedule calculation for modern residential communities.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {user ? (
              <Link
                to={user.role === 'ADMIN' ? '/admin' : user.role === 'WORKER' ? '/worker' : '/resident'}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#18A999] hover:bg-[#13887B] text-white font-semibold rounded-xl shadow-sm flex items-center justify-center space-x-3 transition-all"
              >
                <span>Go to Your Portal ({user.role})</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#18A999] hover:bg-[#13887B] text-white font-semibold rounded-xl shadow-sm flex items-center justify-center space-x-3 transition-all"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Get Started as Resident</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-[#12304A] font-semibold rounded-xl border border-[#E4E9ED] shadow-subtle flex items-center justify-center space-x-3 transition-all"
                >
                  <LogIn className="w-5 h-5 text-[#18A999]" />
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>

          {/* Workflow Diagram */}
          <div className="bg-white p-8 rounded-2xl border border-[#E4E9ED] shadow-card max-w-5xl mx-auto">
            <h3 className="text-xs uppercase tracking-widest font-bold text-[#667085] mb-8">
              End-to-End Autonomous Workflow
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="p-4 rounded-xl bg-[#F7F9F8] border border-[#E4E9ED]">
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#18A999] border border-teal-100 flex items-center justify-center mx-auto mb-3 font-bold text-sm">1</div>
                <h4 className="font-semibold text-sm text-[#12304A]">Resident Report</h4>
                <p className="text-xs text-[#667085] mt-1">Natural language input</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F9F8] border border-[#E4E9ED]">
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#18A999] border border-teal-100 flex items-center justify-center mx-auto mb-3 font-bold text-sm">2</div>
                <h4 className="font-semibold text-sm text-[#12304A]">AI Understanding</h4>
                <p className="text-xs text-[#667085] mt-1">Category & priority</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F9F8] border border-[#E4E9ED]">
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#18A999] border border-teal-100 flex items-center justify-center mx-auto mb-3 font-bold text-sm">3</div>
                <h4 className="font-semibold text-sm text-[#12304A]">Smart Matching</h4>
                <p className="text-xs text-[#667085] mt-1">5-metric match score</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F9F8] border border-[#E4E9ED]">
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#18A999] border border-teal-100 flex items-center justify-center mx-auto mb-3 font-bold text-sm">4</div>
                <h4 className="font-semibold text-sm text-[#12304A]">Smart Scheduling</h4>
                <p className="text-xs text-[#667085] mt-1">Conflict-free slots</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F9F8] border border-[#E4E9ED] col-span-2 md:col-span-1">
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#18A999] border border-teal-100 flex items-center justify-center mx-auto mb-3 font-bold text-sm">5</div>
                <h4 className="font-semibold text-sm text-[#12304A]">Resolution & Rating</h4>
                <p className="text-xs text-[#667085] mt-1">Worker completion</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Innovation Section */}
      <section className="py-16 bg-white border-t border-b border-[#E4E9ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#12304A]">The Core Innovation</h2>
            <p className="text-[#667085] mt-2">Replacing manual paper logbooks and chaos with transparent multi-criteria AI dispatch.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#F7F9F8] p-8 rounded-2xl border border-[#E4E9ED] shadow-subtle">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#18A999] border border-teal-100 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#12304A] mb-3">Multi-Criteria Worker Matching</h3>
              <p className="text-[#17212B] text-sm leading-relaxed mb-4">
                Instead of blindly assigning the first available person, HomeSync AI calculates a multi-factor match score (0–100%):
              </p>
              <ul className="space-y-2 text-xs text-[#17212B]">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-[#18A999] shrink-0" /> <span><strong>40% Skill Match</strong> — Primary & secondary trade skills</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-[#18A999] shrink-0" /> <span><strong>25% Worker Availability</strong> — Real-time active status</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-[#18A999] shrink-0" /> <span><strong>15% Distance / Travel</strong> — Proximity across apartment blocks</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-[#18A999] shrink-0" /> <span><strong>10% Workload</strong> — Active pending job queue length</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-[#18A999] shrink-0" /> <span><strong>10% Historical Performance</strong> — Star rating history</span></li>
              </ul>
            </div>

            <div className="bg-[#F7F9F8] p-8 rounded-2xl border border-[#E4E9ED] shadow-subtle">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#18A999] border border-teal-100 flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#12304A] mb-3">Deterministic Scheduling Engine</h3>
              <p className="text-[#17212B] text-sm leading-relaxed mb-4">
                Scheduling is computed mathematically from actual worker operating hours, active job durations, and resident preferences:
              </p>
              <ul className="space-y-2 text-xs text-[#17212B]">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-[#18A999] shrink-0" /> <span>Prevents double-booking and overlapping schedules</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-[#18A999] shrink-0" /> <span>Includes travel buffer times between apartment blocks</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-[#18A999] shrink-0" /> <span>Generates recommended slot + feasible alternative appointment times</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-[#18A999] shrink-0" /> <span>Allows one-click administrator override whenever required</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
