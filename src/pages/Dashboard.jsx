import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderPlus, FolderOpen, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Clock, Building, Users, Activity, Target } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import Card, { StatCard } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { formatDate, getDaysRemaining, getDeadlineStatus, formatCurrency } from '../utils/helpers'
import { STATUS_COLORS, STATUS_LABELS } from '../utils/constants'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { supabase } from '../lib/supabase'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const { projects, approveProject, rejectProject, isDataLoaded, isDemoData } = useData()
  const [dbStatus, setDbStatus] = useState('checking')
  const navigate = useNavigate()

  useEffect(() => {
    async function checkConnection() {
      try {
        const { error } = await supabase.from('projects').select('id').limit(1)
        if (error) throw error
        setDbStatus('online')
      } catch (err) {
        console.error('Database connection test failed:', err)
        setDbStatus('offline')
      }
    }
    checkConnection()
  }, [])

  // Filter projects for dashboard: 
  // 1. Stats should mostly reflect approved/active projects
  const dashboardProjects = projects.filter(p => {
    // Admins see everything
    if (isAdmin) return true
    // Users see their own projects regardless of status
    if (p.created_by === user?.id) return true
    // Everyone else sees approved/active projects
    return p.status !== 'pending' && p.status !== 'rejected'
  })

  const pendingCount = projects.filter(p => p.status === 'pending').length

  const stats = {
    total: dashboardProjects.length,
    active: dashboardProjects.filter(p => p.status === 'in_progress').length,
    delayed: dashboardProjects.filter(p => p.status === 'delayed').length,
    completed: dashboardProjects.filter(p => p.status === 'completed').length,
    pending: pendingCount, // Now used specifically for "Needs Approval" count
    totalInvestment: dashboardProjects.reduce((s, p) => s + (p.investment_commitment || 0), 0),
    avgCompletion: dashboardProjects.length ? Math.round(dashboardProjects.reduce((s, p) => s + (p.completion_percentage || 0), 0) / dashboardProjects.length) : 0,
    avgCompliance: dashboardProjects.length ? Math.round(dashboardProjects.reduce((s, p) => s + (p.compliance_score || 0), 0) / dashboardProjects.length) : 0,
  }

  const statusData = [
    { name: 'Active', value: stats.active, color: '#059669' },
    { name: 'Delayed', value: stats.delayed, color: '#dc2626' },
    { name: 'Pending', value: stats.pending, color: '#d97706' },
    { name: 'Completed', value: stats.completed, color: '#2563eb' },
  ].filter(d => d.value > 0)

  const completionData = projects.slice(0, 5).map(p => ({
    name: p.title.length > 15 ? p.title.slice(0, 15) + '…' : p.title,
    completion: p.completion_percentage,
    compliance: p.compliance_score,
  }))

  if (!isDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-surface-500 italic">Syncing industrial data...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Demo Mode Warning */}
      {isDemoData && (
        <motion.div variants={item} className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800 shadow-sm">
          <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="font-bold text-sm">Offline / Demo Mode Active</p>
            <p className="text-xs opacity-80 font-medium">We couldn't connect to the live database. You are currently viewing simulated industrial data. Changes will not be saved permanently.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="ml-auto bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
          >
            Retry Connection
          </button>
        </motion.div>
      )}

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Welcome back, {user?.full_name?.split(' ')[0]}</h1>
          <p className="text-sm text-surface-500 mt-1 flex items-center gap-2">
            Here's your project overview for today
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              dbStatus === 'online' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
              dbStatus === 'offline' ? 'bg-red-50 text-red-600 border border-red-100' : 
              'bg-surface-50 text-surface-400 border border-surface-100'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                dbStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 
                dbStatus === 'offline' ? 'bg-red-500' : 
                'bg-surface-300'
              }`} />
              {dbStatus === 'online' ? 'Live DB' : dbStatus === 'offline' ? 'Offline' : 'Checking...'}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          {user && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/projects/new')}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors"
            >
              <FolderPlus size={16} />
              New Project
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 bg-white border border-surface-200 text-surface-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-surface-50 hover:border-surface-300 transition-colors shadow-sm"
          >
            <FolderOpen size={16} />
            View Projects
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building} label="Total Projects" value={stats.total} color="primary" onClick={() => navigate('/projects')} />
        <StatCard icon={Activity} label="Active Projects" value={stats.active} color="success" trend={12} onClick={() => navigate('/projects')} />
        <StatCard icon={AlertTriangle} label="Delayed" value={stats.delayed} color="danger" onClick={() => navigate('/projects')} />
        <StatCard icon={Target} label="Avg Completion" value={`${stats.avgCompletion}%`} color="secondary" />
      </motion.div>

      {/* Secondary Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} color="success" />
        <StatCard icon={Clock} label="Pending / Approved" value={stats.pending} color="warning" />
        <StatCard icon={TrendingUp} label="Total Investment" value={formatCurrency(stats.totalInvestment)} color="primary" />
        <StatCard icon={Users} label="Avg Compliance" value={`${stats.avgCompliance}%`} color={stats.avgCompliance >= 80 ? 'success' : stats.avgCompliance >= 60 ? 'warning' : 'danger'} />
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status Distribution Pie */}
        <Card hover={false} className="p-6">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Project Status Distribution</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', color: '#334155' }}
                />
                <Legend formatter={(value) => <span style={{ color: '#64748b', fontSize: '12px' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Completion Bar Chart */}
        <Card hover={false} className="p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Project Completion vs Compliance</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', color: '#334155' }} />
                <Legend formatter={(value) => <span style={{ color: '#64748b', fontSize: '12px' }}>{value}</span>} />
                <Bar dataKey="completion" name="Completion %" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="compliance" name="Compliance %" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>
      {/* Pending Approvals (Admin Only) */}
      {isAdmin && pendingCount > 0 && (
        <motion.div variants={item}>
          <Card hover={false} className="p-6 border-amber-100 bg-amber-50/30">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-surface-700">Pending Approvals</h3>
                  <p className="text-[10px] text-surface-500">New projects awaiting Industrial Ops clearance</p>
                </div>
              </div>
              <Badge color="warning" size="xs">{pendingCount} Action Required</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.filter(p => p.status === 'pending').map(p => (
                <div key={p.id} className="bg-white border border-surface-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-surface-800 line-clamp-1">{p.title}</h4>
                      <p className="text-[10px] text-surface-400 font-mono mt-0.5">{p.project_code} • {p.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="flex-1 py-1.5 text-[10px] font-bold text-surface-600 bg-surface-50 hover:bg-surface-100 rounded-lg transition-colors border border-surface-200"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Approve ${p.title}?`)) {
                          approveProject(p.id, user.id, user.role, user.full_name, 'Approved via dashboard widget')
                        }
                      }}
                      className="flex-1 py-1.5 text-[10px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors shadow-sm shadow-emerald-200"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Reject ${p.title}?`)) {
                          rejectProject(p.id, user.id, user.role, user.full_name, 'Rejected via dashboard widget')
                        }
                      }}
                      className="flex-1 py-1.5 text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm shadow-red-200"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Recent Projects */}
      <motion.div variants={item}>
        <Card hover={false} className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-surface-700">Recent Projects</h3>
            <button onClick={() => navigate('/projects')} className="text-xs text-primary-600 hover:text-primary-700 font-semibold">View All →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left py-3 px-3 text-surface-400 font-semibold text-xs uppercase tracking-wider">Project</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-semibold text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Stage</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-semibold text-xs uppercase tracking-wider">Progress</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {dashboardProjects.slice(0, 5).map(p => {
                  const dlStatus = getDeadlineStatus(p.deadline)
                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="border-b border-surface-50 hover:bg-surface-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3">
                        <p className="font-semibold text-surface-800">{p.title}</p>
                        <p className="text-xs text-surface-400 mt-0.5 font-mono">{p.project_code}</p>
                      </td>
                      <td className="py-3 px-3">
                        <Badge color={p.status === 'in_progress' ? 'success' : p.status === 'delayed' ? 'danger' : p.status === 'completed' ? 'primary' : 'warning'} dot>
                          {STATUS_LABELS[p.status]}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-surface-500 text-xs hidden sm:table-cell">{p.current_stage}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden max-w-[80px]">
                            <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${p.completion_percentage}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-surface-600">{p.completion_percentage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        <span className={`text-xs font-semibold status-${dlStatus}`}>{getDaysRemaining(p.deadline)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
