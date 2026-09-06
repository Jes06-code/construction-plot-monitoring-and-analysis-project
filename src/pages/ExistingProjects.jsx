import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, Calendar, TrendingUp, Building, CheckCircle2, XCircle } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { formatDate, getDaysRemaining, getDeadlineStatus, formatCurrency } from '../utils/helpers'
import { STATUS_LABELS } from '../utils/constants'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function ExistingProjects() {
  const { projects, approveProject, rejectProject, isDataLoaded } = useData()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [processingId, setProcessingId] = useState(null)

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.project_code.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleApprove = async (e, projectId) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to approve this project?')) return
    setProcessingId(projectId)
    try {
      await approveProject(projectId, user.id, user.role, user.full_name, 'Approved via dashboard')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (e, projectId) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to reject/terminate this project?')) return
    setProcessingId(projectId)
    try {
      await rejectProject(projectId, user.id, user.role, user.full_name, 'Rejected via dashboard')
    } finally {
      setProcessingId(null)
    }
  }

  const statusColor = (status) => {
    const map = { pending: 'warning', approved: 'success', in_progress: 'success', delayed: 'danger', completed: 'success', cancelled: 'gray', rejected: 'danger' }
    return map[status] || 'gray'
  }

  if (!isDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-surface-500 italic">Syncing project records...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Projects</h1>
          <p className="text-sm text-surface-500 mt-1">{filtered.length} project{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, code, or location..."
            className="w-full bg-white border border-surface-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', 'in_progress', 'delayed', 'pending', 'approved', 'completed', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === s
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-surface-600 hover:text-surface-800 border border-surface-200 hover:border-surface-300'
                }`}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Project Cards Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(project => {
          const dlStatus = getDeadlineStatus(project.deadline)
          return (
            <motion.div key={project.id} variants={item}>
              <Card onClick={() => navigate(`/projects/${project.id}`)} className="h-full p-5">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] text-surface-400 font-mono">{project.project_code}</p>
                    <h3 className="text-base font-semibold text-surface-800 mt-0.5 leading-tight">{project.title}</h3>
                  </div>
                  <div className="shrink-0">
                    <Badge color={statusColor(project.status)} dot size="xs">
                      {STATUS_LABELS[project.status]}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-surface-500">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-surface-500">
                    <Building size={12} className="shrink-0" />
                    <span>Stage: {project.current_stage || 'Not started'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-surface-500">
                    <TrendingUp size={12} className="shrink-0" />
                    <span>Investment: {formatCurrency(project.investment_commitment)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-surface-400 font-medium">Completion</span>
                    <span className="text-xs font-bold text-surface-700">{project.completion_percentage}%</span>
                  </div>
                  <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.completion_percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full bg-primary-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Action Buttons for Industrial Ops (Admin) */}
                {user?.email === 'government@gmail.com' && project.status === 'pending' && (
                  <div className="flex gap-2 mb-4 pt-2 border-t border-surface-50">
                    <Button
                      disabled={processingId === project.id}
                      onClick={(e) => handleApprove(e, project.id)}
                      className="flex-1"
                      variant="success"
                      size="sm"
                      icon={CheckCircle2}
                    >
                      Approve
                    </Button>
                    <Button
                      disabled={processingId === project.id}
                      onClick={(e) => handleReject(e, project.id)}
                      className="flex-1"
                      variant="danger"
                      size="sm"
                      icon={XCircle}
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {/* Approval Notification */}
                {project.status === 'approved' && (
                  <div className="mb-4 p-3 bg-emerald-500 text-white rounded-xl flex items-center gap-3 shadow-lg shadow-emerald-500/20 animate-in zoom-in duration-500">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none">Status: Approved</p>
                      <p className="text-[9px] font-medium opacity-90 mt-0.5">Industrial operations clearance granted.</p>
                    </div>
                  </div>
                )}

                {/* Rejection Notification */}
                {project.status === 'rejected' && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-700 animate-in fade-in slide-in-from-top-1 duration-300">
                    <XCircle size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Project Terminated</span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Calendar size={12} className={`status-${dlStatus}`} />
                    <span className={`font-semibold status-${dlStatus}`}>{getDaysRemaining(project.deadline)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-surface-400">Compliance</span>
                    <span className={`text-xs font-bold ${project.compliance_score >= 80 ? 'text-emerald-600' : project.compliance_score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                      {project.compliance_score}%
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-surface-400 text-lg font-medium">No projects found</p>
          <p className="text-surface-300 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </motion.div>
  )
}
