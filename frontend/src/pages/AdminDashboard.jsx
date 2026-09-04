import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Users, Building, Wrench, Search, Filter, RefreshCw, BarChart2,
  Plus, Edit, Trash2, CheckCircle2, Clock, AlertTriangle, Star, MapPin, ChevronRight, X
} from 'lucide-react';
import { requestAPI, workerAPI, blockAPI, analyticsAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'workers' | 'blocks'

  // Data states
  const [requests, setRequests] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters for requests
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [blockFilter, setBlockFilter] = useState('');

  // Worker Modal state
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [workerFormData, setWorkerFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    skills: 'Plumbing',
    current_block: 'Block A',
    availability_status: 'Available',
    working_hours_start: '09:00',
    working_hours_end: '18:00',
    experience_years: 5
  });

  // Block Modal state
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [blockFormData, setBlockFormData] = useState({
    name: '',
    details: '',
    total_flats: 40
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, workerRes, blockRes, analyticsRes] = await Promise.all([
        requestAPI.getRequests({
          search: search.trim() || undefined,
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
          priority: priorityFilter || undefined,
          block: blockFilter || undefined
        }),
        workerAPI.getWorkers(),
        blockAPI.getBlocks(),
        analyticsAPI.getMetrics()
      ]);

      setRequests(reqRes.data);
      setWorkers(workerRes.data);
      setBlocks(blockRes.data);
      setSummary(analyticsRes.data.summary);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, categoryFilter, priorityFilter, blockFilter]);

  // Worker Handlers
  const handleOpenAddWorker = () => {
    setEditingWorker(null);
    setWorkerFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      skills: 'Plumbing',
      current_block: blocks.length > 0 ? blocks[0].name : 'Block A',
      availability_status: 'Available',
      working_hours_start: '09:00',
      working_hours_end: '18:00',
      experience_years: 5
    });
    setIsWorkerModalOpen(true);
  };

  const handleOpenEditWorker = (w) => {
    setEditingWorker(w);
    setWorkerFormData({
      name: w.name,
      email: w.email || '',
      password: '',
      phone: w.phone || '',
      skills: Array.isArray(w.skills) ? w.skills.join(', ') : w.skills,
      current_block: w.current_block || 'Block A',
      availability_status: w.availability_status || 'Available',
      working_hours_start: w.working_hours_start || '09:00',
      working_hours_end: w.working_hours_end || '18:00',
      experience_years: w.experience_years || 5,
      rating: w.rating || 5.0
    });
    setIsWorkerModalOpen(true);
  };

  const handleSaveWorker = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = workerFormData.skills.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        ...workerFormData,
        skills: skillsArray
      };

      if (editingWorker) {
        await workerAPI.updateWorker(editingWorker.id, payload);
      } else {
        await workerAPI.createWorker(payload);
      }

      setIsWorkerModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save worker');
    }
  };

  const handleDeleteWorker = async (workerId) => {
    if (!confirm('Are you sure you want to remove or deactivate this worker?')) return;
    try {
      await workerAPI.deleteWorker(workerId);
      fetchData();
    } catch (err) {
      alert('Failed to remove worker');
    }
  };

  const handleWorkerStatusToggle = async (workerId, currentStatus) => {
    const nextStatus = currentStatus === 'Available' ? 'Busy' : currentStatus === 'Busy' ? 'Offline' : 'Available';
    try {
      await workerAPI.updateStatus(workerId, nextStatus);
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Block Handlers
  const handleOpenAddBlock = () => {
    setEditingBlock(null);
    setBlockFormData({ name: '', details: '', total_flats: 40 });
    setIsBlockModalOpen(true);
  };

  const handleOpenEditBlock = (b) => {
    setEditingBlock(b);
    setBlockFormData({ name: b.name, details: b.details || '', total_flats: b.total_flats || 40 });
    setIsBlockModalOpen(true);
  };

  const handleSaveBlock = async (e) => {
    e.preventDefault();
    try {
      if (editingBlock) {
        await blockAPI.updateBlock(editingBlock.id, blockFormData);
      } else {
        await blockAPI.createBlock(blockFormData);
      }
      setIsBlockModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save block');
    }
  };

  const handleDeleteBlock = async (blockId) => {
    if (!confirm('Are you sure you want to remove this block?')) return;
    try {
      await blockAPI.deleteBlock(blockId);
      fetchData();
    } catch (err) {
      alert('Failed to remove block');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-white">Facility Control Room</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Multi-criteria autonomous dispatch & community operations</p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/admin/analytics"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            <BarChart2 className="w-4 h-4" />
            <span>Analytics Suite</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4">
          <div className="glass-card p-4 rounded-2xl border border-blue-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Requests</span>
            <div className="text-2xl font-extrabold text-white mt-1.5">{summary.totalRequests}</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-amber-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1.5">{summary.pendingRequests}</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-sky-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">In Progress</span>
            <div className="text-2xl font-extrabold text-sky-400 mt-1.5">{summary.inProgressRequests}</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-emerald-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Completed</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1.5">{summary.completedRequests}</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-purple-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Staff Available</span>
            <div className="text-2xl font-extrabold text-purple-400 mt-1.5">
              {summary.availableWorkers} <span className="text-xs font-normal text-slate-500">/ {summary.totalWorkers}</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-cyan-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Residents</span>
            <div className="text-2xl font-extrabold text-cyan-400 mt-1.5">{summary.totalResidents}</div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-6">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'requests' 
              ? 'text-white border-blue-500' 
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <span>Maintenance Requests</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {requests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('workers')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'workers' 
              ? 'text-white border-indigo-500' 
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-400" />
          <span>Worker Management</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {workers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('blocks')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'blocks' 
              ? 'text-white border-purple-500' 
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4 text-purple-400" />
          <span>Apartment Blocks</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {blocks.length}
          </span>
        </button>
      </div>

      {/* TAB 1: MAINTENANCE REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by ticket code or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="AI_ANALYZED">AI Analyzed</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="WORKER_ON_WAY">Worker on Way</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Appliance">Appliance</option>
                <option value="Civil / Structural">Civil / Structural</option>
                <option value="Cleaning">Cleaning</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Requests Table */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800 text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Ticket</th>
                    <th className="py-3.5 px-4">Problem Description</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Resident</th>
                    <th className="py-3.5 px-4">Assigned Worker</th>
                    <th className="py-3.5 px-4">Scheduled Slot</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">Loading requests...</td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-slate-500 space-y-2">
                        <Wrench className="w-8 h-8 mx-auto opacity-40 mb-2" />
                        <p className="text-sm font-semibold text-slate-400">No maintenance requests yet.</p>
                        <p className="text-xs text-slate-500">New complaints reported by residents will appear here.</p>
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-400">
                          #{req.ticket_code}
                        </td>

                        <td className="py-3 px-4 max-w-xs truncate text-slate-200 font-medium">
                          {req.subcategory || req.description}
                        </td>

                        <td className="py-3 px-4 text-slate-300">
                          {req.category}
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.priority === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            req.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {req.priority}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">{req.resident_name}</div>
                          <div className="text-[10px] text-slate-400">{req.block} • {req.flat_number}</div>
                        </td>

                        <td className="py-3 px-4">
                          {req.worker_name ? (
                            <div>
                              <div className="font-bold text-emerald-400">{req.worker_name}</div>
                              {req.match_score && (
                                <span className="text-[10px] text-slate-400 font-mono">{req.match_score}% Match</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-300">
                          {req.start_time ? `${req.start_time} - ${req.end_time}` : 'TBD'}
                        </td>

                        <td className="py-3 px-4">
                          <StatusBadge status={req.status} />
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/requests/${req.id}`}
                            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 transition-colors"
                          >
                            <span>Review</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: WORKER MANAGEMENT */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Manage real service staff, trades, operating hours, and location assignments</p>
            <button
              onClick={handleOpenAddWorker}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add Worker</span>
            </button>
          </div>

          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800 text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Worker</th>
                    <th className="py-3.5 px-4">Skills / Trades</th>
                    <th className="py-3.5 px-4">Assigned Block</th>
                    <th className="py-3.5 px-4">Working Hours</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Jobs (Active/Done)</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {workers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-slate-500 space-y-2">
                        <Users className="w-8 h-8 mx-auto opacity-40 mb-2" />
                        <p className="text-sm font-semibold text-slate-400">No workers added yet.</p>
                        <p className="text-xs text-slate-500 mb-3">Add technicians to begin autonomous multi-criteria dispatch.</p>
                        <button
                          onClick={handleOpenAddWorker}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs"
                        >
                          + Add First Worker
                        </button>
                      </td>
                    </tr>
                  ) : (
                    workers.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-sm">{w.name}</div>
                          <div className="text-[10px] text-slate-400">{w.email || w.phone || 'No email'}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(w.skills) ? w.skills : []).map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-200">
                          {w.current_block || 'Unassigned'}
                        </td>

                        <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                          {w.working_hours_start} – {w.working_hours_end}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleWorkerStatusToggle(w.id, w.availability_status)}
                            title="Click to toggle status"
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                              w.availability_status === 'Available' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30' :
                              w.availability_status === 'Busy' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30' :
                              'bg-slate-700/40 text-slate-400 border-slate-600 hover:bg-slate-700/60'
                            }`}
                          >
                            {w.availability_status}
                          </button>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <span className="text-amber-400 font-bold">{w.active_jobs || 0}</span> active / <span className="text-emerald-400 font-bold">{w.completed_jobs || 0}</span> completed
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1 text-amber-400 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{Number(w.rating).toFixed(1)}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditWorker(w)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Edit Worker"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteWorker(w.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Remove Worker"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BLOCK MANAGEMENT */}
      {activeTab === 'blocks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Manage residential apartment blocks and units</p>
            <button
              onClick={handleOpenAddBlock}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-purple-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add Block</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blocks.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 glass-card rounded-3xl border border-slate-800">
                <Building className="w-8 h-8 mx-auto opacity-40 mb-2" />
                <p className="text-sm font-semibold text-slate-400">No apartment blocks configured yet.</p>
                <button
                  onClick={handleOpenAddBlock}
                  className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold"
                >
                  + Add First Block
                </button>
              </div>
            ) : (
              blocks.map((b) => (
                <div key={b.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <Building className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold text-white">{b.name}</h3>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {b.total_flats} Flats
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{b.details || 'Standard residential tower'}</p>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleOpenEditBlock(b)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteBlock(b.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium flex items-center space-x-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT WORKER */}
      {isWorkerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsWorkerModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">
                {editingWorker ? 'Edit Service Staff' : 'Add New Service Staff'}
              </h3>
              <button onClick={() => setIsWorkerModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={workerFormData.name}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingWorker}
                    placeholder="worker@example.com"
                    value={workerFormData.email}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98989 00000"
                    value={workerFormData.phone}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100"
                  />
                </div>
              </div>

              {!editingWorker && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Worker Login Password</label>
                  <input
                    type="password"
                    placeholder="Defaults to password123"
                    value={workerFormData.password}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, password: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Skills / Trades (comma-separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plumbing, Water Supply, Drainage"
                  value={workerFormData.skills}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, skills: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Examples: Plumbing, Electrical, Carpentry, Appliance, Cleaning, Civil</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Current Block Assignment</label>
                  <select
                    value={workerFormData.current_block}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, current_block: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                  >
                    {blocks.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Availability Status</label>
                  <select
                    value={workerFormData.availability_status}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, availability_status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Shift Start</label>
                  <input
                    type="time"
                    value={workerFormData.working_hours_start}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, working_hours_start: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Shift End</label>
                  <input
                    type="time"
                    value={workerFormData.working_hours_end}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, working_hours_end: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors mt-2"
              >
                {editingWorker ? 'Save Changes' : 'Create Worker Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT BLOCK */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsBlockModalOpen(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">
                {editingBlock ? 'Edit Apartment Block' : 'Add Apartment Block'}
              </h3>
              <button onClick={() => setIsBlockModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlock} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Block Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block G"
                  value={blockFormData.name}
                  onChange={(e) => setBlockFormData({ ...blockFormData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Details / Wing Description</label>
                <input
                  type="text"
                  placeholder="e.g. East Wing - Phase 2"
                  value={blockFormData.details}
                  onChange={(e) => setBlockFormData({ ...blockFormData, details: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Total Flats / Units</label>
                <input
                  type="number"
                  min="1"
                  value={blockFormData.total_flats}
                  onChange={(e) => setBlockFormData({ ...blockFormData, total_flats: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition-colors mt-2"
              >
                {editingBlock ? 'Save Changes' : 'Create Block'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
