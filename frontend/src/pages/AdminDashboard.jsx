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
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-navy-primary/5 flex items-center justify-center border border-navy-primary/10">
              <Shield className="w-5 h-5 text-navy-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-navy-primary tracking-tight">Facility Control Room</h1>
          </div>
          <p className="text-xs text-slate-gray mt-1 font-medium">Multi-criteria autonomous dispatch & community operations</p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-gray transition-colors border border-theme-border shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/admin/analytics"
            className="px-4 py-2.5 bg-navy-primary hover:bg-[#1b4366] text-white font-semibold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-sm"
          >
            <BarChart2 className="w-4 h-4 text-teal-primary" />
            <span>Analytics Suite</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-theme-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-gray tracking-wider block">Total Requests</span>
            <div className="text-2xl font-extrabold text-navy-primary mt-1.5">{summary.totalRequests}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-theme-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider block">Pending</span>
            <div className="text-2xl font-extrabold text-amber-500 mt-1.5">{summary.pendingRequests}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-theme-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-teal-primary tracking-wider block">In Progress</span>
            <div className="text-2xl font-extrabold text-teal-primary mt-1.5">{summary.inProgressRequests}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-theme-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-semantic-success tracking-wider block">Completed</span>
            <div className="text-2xl font-extrabold text-semantic-success mt-1.5">{summary.completedRequests}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-theme-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-gray tracking-wider block">Staff Available</span>
            <div className="text-2xl font-extrabold text-navy-primary mt-1.5">
              {summary.availableWorkers} <span className="text-xs font-normal text-slate-gray">/ {summary.totalWorkers}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-theme-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-gray tracking-wider block">Residents</span>
            <div className="text-2xl font-extrabold text-navy-primary mt-1.5">{summary.totalResidents}</div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-theme-border space-x-6">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'requests' 
              ? 'text-navy-primary border-teal-primary' 
              : 'text-slate-gray border-transparent hover:text-navy-primary'
          }`}
        >
          <span>Maintenance Requests</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-gray font-mono font-semibold">
            {requests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('workers')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'workers' 
              ? 'text-navy-primary border-teal-primary' 
              : 'text-slate-gray border-transparent hover:text-navy-primary'
          }`}
        >
          <Wrench className="w-4 h-4 text-teal-primary" />
          <span>Worker Management</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-gray font-mono font-semibold">
            {workers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('blocks')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'blocks' 
              ? 'text-navy-primary border-teal-primary' 
              : 'text-slate-gray border-transparent hover:text-navy-primary'
          }`}
        >
          <Building className="w-4 h-4 text-teal-primary" />
          <span>Apartment Blocks</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-gray font-mono font-semibold">
            {blocks.length}
          </span>
        </button>
      </div>

      {/* TAB 1: MAINTENANCE REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-theme-border shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-slate-gray absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by ticket code or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-theme-border rounded-xl pl-9 pr-3 py-2 text-xs text-charcoal focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-all placeholder:text-slate-400"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-theme-border rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-all"
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
                className="bg-white border border-theme-border rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-all"
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
                className="bg-white border border-theme-border rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-all"
              >
                <option value="">All Priorities</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-2xl border border-theme-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-charcoal">
                <thead className="bg-[#F7F9F8] text-slate-gray uppercase font-semibold border-b border-theme-border text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Ticket</th>
                    <th className="py-3.5 px-4 font-semibold">Problem Description</th>
                    <th className="py-3.5 px-4 font-semibold">Category</th>
                    <th className="py-3.5 px-4 font-semibold">Priority</th>
                    <th className="py-3.5 px-4 font-semibold">Resident</th>
                    <th className="py-3.5 px-4 font-semibold">Assigned Worker</th>
                    <th className="py-3.5 px-4 font-semibold">Scheduled Slot</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border/60">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-gray font-medium">Loading requests...</td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-slate-gray space-y-2">
                        <Wrench className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-semibold text-charcoal">No maintenance requests yet.</p>
                        <p className="text-xs text-slate-gray">New complaints reported by residents will appear here.</p>
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-navy-primary">
                          #{req.ticket_code}
                        </td>

                        <td className="py-3.5 px-4 max-w-xs truncate text-charcoal font-medium">
                          {req.subcategory || req.description}
                        </td>

                        <td className="py-3.5 px-4 text-slate-gray font-medium">
                          {req.category}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.priority === 'HIGH' ? 'bg-red-50 text-semantic-error border border-red-200' :
                            req.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {req.priority}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-charcoal">{req.resident_name}</div>
                          <div className="text-[10px] text-slate-gray">{req.block} • {req.flat_number}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          {req.worker_name ? (
                            <div>
                              <div className="font-bold text-teal-primary">{req.worker_name}</div>
                              {req.match_score && (
                                <span className="text-[10px] text-slate-gray font-mono">{req.match_score}% Match</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-gray font-medium">
                          {req.start_time ? `${req.start_time} - ${req.end_time}` : 'TBD'}
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusBadge status={req.status} />
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/requests/${req.id}`}
                            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100/80 text-teal-primary border border-teal-200/60 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 transition-colors"
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
            <p className="text-xs text-slate-gray font-medium">Manage real service staff, trades, operating hours, and location assignments</p>
            <button
              onClick={handleOpenAddWorker}
              className="px-4 py-2 bg-teal-primary hover:bg-[#13887B] text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Worker</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-theme-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-charcoal">
                <thead className="bg-[#F7F9F8] text-slate-gray uppercase font-semibold border-b border-theme-border text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Worker</th>
                    <th className="py-3.5 px-4 font-semibold">Skills / Trades</th>
                    <th className="py-3.5 px-4 font-semibold">Assigned Block</th>
                    <th className="py-3.5 px-4 font-semibold">Working Hours</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Jobs (Active/Done)</th>
                    <th className="py-3.5 px-4 font-semibold">Rating</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border/60">
                  {workers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-slate-gray space-y-2">
                        <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-semibold text-charcoal">No workers added yet.</p>
                        <p className="text-xs text-slate-gray mb-3">Add technicians to begin autonomous multi-criteria dispatch.</p>
                        <button
                          onClick={handleOpenAddWorker}
                          className="px-4 py-2 bg-teal-primary hover:bg-[#13887B] text-white font-semibold rounded-xl text-xs"
                        >
                          + Add First Worker
                        </button>
                      </td>
                    </tr>
                  ) : (
                    workers.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-navy-primary text-sm">{w.name}</div>
                          <div className="text-[10px] text-slate-gray">{w.email || w.phone || 'No email'}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(w.skills) ? w.skills : []).map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-teal-50 text-teal-primary border border-teal-100 text-[10px] font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-charcoal font-medium">
                          {w.current_block || 'Unassigned'}
                        </td>

                        <td className="py-3.5 px-4 text-slate-gray font-mono text-[11px]">
                          {w.working_hours_start} – {w.working_hours_end}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleWorkerStatusToggle(w.id, w.availability_status)}
                            title="Click to toggle status"
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                              w.availability_status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                              w.availability_status === 'Busy' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                              'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {w.availability_status}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-xs">
                          <span className="text-amber-600 font-bold">{w.active_jobs || 0}</span> active / <span className="text-semantic-success font-bold">{w.completed_jobs || 0}</span> done
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{Number(w.rating).toFixed(1)}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditWorker(w)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-gray transition-colors border border-theme-border"
                            title="Edit Worker"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteWorker(w.id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-semantic-error transition-colors border border-red-100"
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
            <p className="text-xs text-slate-gray font-medium">Manage residential apartment blocks and units</p>
            <button
              onClick={handleOpenAddBlock}
              className="px-4 py-2 bg-teal-primary hover:bg-[#13887B] text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Block</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blocks.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-gray bg-white rounded-2xl border border-theme-border shadow-sm">
                <Building className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-charcoal">No apartment blocks configured yet.</p>
                <button
                  onClick={handleOpenAddBlock}
                  className="mt-3 px-4 py-2 bg-teal-primary hover:bg-[#13887B] text-white rounded-xl text-xs font-semibold"
                >
                  + Add First Block
                </button>
              </div>
            ) : (
              blocks.map((b) => (
                <div key={b.id} className="bg-white p-5 rounded-2xl border border-theme-border shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-xl bg-teal-50 text-teal-primary border border-teal-100">
                          <Building className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold text-navy-primary">{b.name}</h3>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-gray">
                        {b.total_flats} Flats
                      </span>
                    </div>
                    <p className="text-xs text-slate-gray">{b.details || 'Standard residential tower'}</p>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-theme-border/60">
                    <button
                      onClick={() => handleOpenEditBlock(b)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-gray border border-theme-border text-xs font-medium flex items-center space-x-1 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteBlock(b.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-semantic-error border border-red-100 text-xs font-medium flex items-center space-x-1 transition-colors"
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
          <div className="fixed inset-0 bg-navy-primary/40 backdrop-blur-sm" onClick={() => setIsWorkerModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white border border-theme-border p-6 rounded-3xl shadow-xl z-10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-theme-border">
              <h3 className="font-bold text-base text-navy-primary">
                {editingWorker ? 'Edit Service Staff' : 'Add New Service Staff'}
              </h3>
              <button onClick={() => setIsWorkerModalOpen(false)} className="text-slate-gray hover:text-charcoal p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={workerFormData.name}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                  className="w-full bg-white border border-theme-border rounded-xl px-3.5 py-2 text-sm text-charcoal focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingWorker}
                    placeholder="worker@example.com"
                    value={workerFormData.email}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, email: e.target.value })}
                    className="w-full bg-white border border-theme-border rounded-xl px-3.5 py-2 text-sm text-charcoal disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98989 00000"
                    value={workerFormData.phone}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, phone: e.target.value })}
                    className="w-full bg-white border border-theme-border rounded-xl px-3.5 py-2 text-sm text-charcoal focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-all"
                  />
                </div>
              </div>

              {!editingWorker && (
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Worker Login Password</label>
                  <input
                    type="password"
                    placeholder="Defaults to password123"
                    value={workerFormData.password}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, password: e.target.value })}
                    className="w-full bg-white border border-theme-border rounded-xl px-3.5 py-2 text-sm text-charcoal focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-charcoal mb-1">Skills / Trades (comma-separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plumbing, Water Supply, Drainage"
                  value={workerFormData.skills}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, skills: e.target.value })}
                  className="w-full bg-white border border-theme-border rounded-xl px-3.5 py-2 text-sm text-charcoal focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-all"
                />
                <span className="text-[10px] text-slate-gray mt-1 block">Examples: Plumbing, Electrical, Carpentry, Appliance, Cleaning, Civil</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Current Block Assignment</label>
                  <select
                    value={workerFormData.current_block}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, current_block: e.target.value })}
                    className="w-full bg-white border border-theme-border rounded-xl px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-all"
                  >
                    {blocks.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Availability Status</label>
                  <select
                    value={workerFormData.availability_status}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, availability_status: e.target.value })}
                    className="w-full bg-white border border-theme-border rounded-xl px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-all"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Shift Start</label>
                  <input
                    type="time"
                    value={workerFormData.working_hours_start}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, working_hours_start: e.target.value })}
                    className="w-full bg-white border border-theme-border rounded-xl px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Shift End</label>
                  <input
                    type="time"
                    value={workerFormData.working_hours_end}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, working_hours_end: e.target.value })}
                    className="w-full bg-white border border-theme-border rounded-xl px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-primary hover:bg-[#13887B] text-white font-semibold rounded-xl text-sm transition-colors mt-2 shadow-sm"
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
          <div className="fixed inset-0 bg-navy-primary/40 backdrop-blur-sm" onClick={() => setIsBlockModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white border border-theme-border p-6 rounded-3xl shadow-xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-theme-border">
              <h3 className="font-bold text-base text-navy-primary">
                {editingBlock ? 'Edit Apartment Block' : 'Add Apartment Block'}
              </h3>
              <button onClick={() => setIsBlockModalOpen(false)} className="text-slate-gray hover:text-charcoal p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlock} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Block Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block G"
                  value={blockFormData.name}
                  onChange={(e) => setBlockFormData({ ...blockFormData, name: e.target.value })}
                  className="w-full bg-white border border-theme-border rounded-xl px-3.5 py-2 text-sm text-charcoal focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Details / Wing Description</label>
                <input
                  type="text"
                  placeholder="e.g. East Wing - Phase 2"
                  value={blockFormData.details}
                  onChange={(e) => setBlockFormData({ ...blockFormData, details: e.target.value })}
                  className="w-full bg-white border border-theme-border rounded-xl px-3.5 py-2 text-sm text-charcoal focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Total Flats / Units</label>
                <input
                  type="number"
                  min="1"
                  value={blockFormData.total_flats}
                  onChange={(e) => setBlockFormData({ ...blockFormData, total_flats: e.target.value })}
                  className="w-full bg-white border border-theme-border rounded-xl px-3.5 py-2 text-sm text-charcoal focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-primary hover:bg-[#13887B] text-white font-semibold rounded-xl text-sm transition-colors mt-2 shadow-sm"
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
