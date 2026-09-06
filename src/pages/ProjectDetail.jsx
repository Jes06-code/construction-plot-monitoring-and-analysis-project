import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, MapPin, Calendar, Users, Target, Shield, CheckCircle2,
  Circle, FileText, Camera, BrainCircuit, TrendingUp, Download, Trash2
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import { formatDate, formatDateTime, getDaysRemaining, getDeadlineStatus, formatCurrency, getComplianceColor } from '../utils/helpers'
import { STATUS_LABELS, RISK_COLORS } from '../utils/constants'
import { generateProjectPDF, generateProjectExcel } from '../utils/reportGenerator'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const TABS = ['Overview', 'Milestones', 'Budget', 'Progress', 'AI Analysis', 'Documents']

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const {
    projects, updateProject, deleteProject,
    approveProject, rejectProject,
    getProjectMilestones, toggleMilestone, addMilestone,
    getProjectBudget, getProjectImages, getProjectDocuments,
  } = useData()

  const [tab, setTab] = useState(0)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [newMilestone, setNewMilestone] = useState({ title: '', target_date: '' })

  const project = projects.find(p => p.id === id)
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-surface-400 font-medium">Project not found</p>
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/projects')} className="mt-4">Back to Projects</Button>
      </div>
    )
  }

  const milestones = getProjectMilestones(id)
  const budgetEntries = getProjectBudget(id)
  const images = getProjectImages(id)
  const documents = getProjectDocuments(id)
  const dlStatus = getDeadlineStatus(project.deadline)

  const totalAllocated = budgetEntries.reduce((s, b) => s + Math.max(b.allocated || 0, b.spent || 0), 0)
  const totalSpent = budgetEntries.reduce((s, b) => s + (b.spent || 0), 0)
  const budgetUsage = totalAllocated ? Math.round((totalSpent / totalAllocated) * 100) : 0
  const budgetChartData = budgetEntries.map(b => ({ name: b.category, Allocated: Math.max(b.allocated || 0, b.spent || 0), Spent: b.spent }))

  const handleAddMilestone = () => {
    if (!newMilestone.title) return
    addMilestone({ project_id: id, ...newMilestone, order_index: milestones.length + 1 })
    setNewMilestone({ title: '', target_date: '' })
    setShowMilestoneModal(false)
  }

  const handleDeleteProject = () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProject(id)
      navigate('/projects')
    }
  }

  const latestAnalysis = images.find(img => img.ai_analysis)?.ai_analysis
  const tooltipStyle = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', color: '#334155' }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate('/projects')} className="p-2 rounded-xl hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors mt-0.5">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-xl font-bold text-surface-800">{project.title}</h1>
              <Badge color={project.status === 'in_progress' ? 'success' : project.status === 'delayed' ? 'danger' : project.status === 'approved' ? 'success' : project.status === 'rejected' ? 'danger' : 'warning'} dot>
                {STATUS_LABELS[project.status]}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-surface-400 flex-wrap">
              <span className="font-mono">{project.project_code}</span>
              <span className="flex items-center gap-1"><MapPin size={11} />{project.location}</span>
              <span className={`flex items-center gap-1 font-semibold status-${dlStatus}`}><Calendar size={11} />{getDaysRemaining(project.deadline)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {user?.role === 'admin' && project.status === 'pending' && (
            <>
              <Button
                variant="success"
                size="sm"
                icon={CheckCircle2}
                onClick={() => {
                  if (window.confirm('Approve this project?')) {
                    approveProject(project.id, user.id, user.role, user.full_name, 'Approved via details page')
                  }
                }}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={XCircle}
                onClick={() => {
                  if (window.confirm('Terminate/Reject this project?')) {
                    rejectProject(project.id, user.id, user.role, user.full_name, 'Rejected via details page')
                  }
                }}
              >
                Reject
              </Button>
            </>
          )}
          <Button variant="secondary" size="sm" icon={Download} onClick={() => generateProjectPDF(project, milestones, budgetEntries)}>PDF</Button>
          <Button variant="secondary" size="sm" icon={Download} onClick={() => generateProjectExcel(project, milestones, budgetEntries)}>Excel</Button>
          {isAdmin && project.status !== 'pending' && project.status !== 'rejected' && <Button variant="danger" size="sm" icon={Trash2} onClick={handleDeleteProject}>Delete</Button>}
        </div>
      </div>

      {/* Approval Notification */}
      {project.status === 'approved' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-500 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-xl shadow-emerald-500/20 mb-8 border border-emerald-400"
        >
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/30">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-xl font-black uppercase tracking-tight">Project Approved</h3>
            <p className="text-sm font-medium opacity-90 mt-1 max-w-md">This project has been officially verified and cleared by Industrial Operations. Monitoring and data collection are now active.</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">Active Status</span>
          </div>
        </motion.div>
      )}

      {/* Rejection Notification */}
      {project.status === 'rejected' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800 shadow-sm"
        >
          <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
            <CheckCircle2 size={20} className="rotate-45" />
          </div>
          <div>
            <p className="font-bold text-sm">Project Terminated</p>
            <p className="text-xs opacity-80 font-medium">This project has been rejected/terminated. No further progress is allowed.</p>
          </div>
        </motion.div>
      )}


      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Completion', value: `${project.completion_percentage}%`, icon: TrendingUp, bg: 'bg-primary-50', text: 'text-primary-700', iconColor: 'text-primary-500' },
          { label: 'Stage', value: project.current_stage || 'N/A', icon: Target, bg: 'bg-indigo-50', text: 'text-indigo-700', iconColor: 'text-indigo-500' },
          { label: 'Investment', value: formatCurrency(project.investment_commitment), icon: TrendingUp, bg: 'bg-emerald-50', text: 'text-emerald-700', iconColor: 'text-emerald-500' },
          { label: 'Workforce', value: project.workforce_commitment || 'N/A', icon: Users, bg: 'bg-amber-50', text: 'text-amber-700', iconColor: 'text-amber-500' },
          { label: 'Compliance', value: `${project.compliance_score}%`, icon: Shield, bg: project.compliance_score >= 80 ? 'bg-emerald-50' : 'bg-amber-50', text: project.compliance_score >= 80 ? 'text-emerald-700' : 'text-amber-700', iconColor: project.compliance_score >= 80 ? 'text-emerald-500' : 'text-amber-500' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border border-surface-100 rounded-xl p-3`}>
            <s.icon size={15} className={`${s.iconColor} mb-1.5`} />
            <p className={`text-base font-bold ${s.text} truncate`}>{s.value}</p>
            <p className="text-[10px] text-surface-400 uppercase tracking-wider font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto bg-surface-100 p-1 rounded-xl border border-surface-200">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${tab === i ? 'bg-white text-surface-800 shadow-sm border border-surface-200' : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>

          {/* Overview */}
          {tab === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card hover={false} className="p-6 flex flex-col items-center justify-center">
                <h3 className="text-sm font-semibold text-surface-700 mb-4 self-start">Overall Progress</h3>
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563eb" strokeWidth="3" strokeDasharray={`${project.completion_percentage}, 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-surface-800">{project.completion_percentage}%</span>
                    <span className="text-[10px] text-surface-400">Complete</span>
                  </div>
                </div>
              </Card>

              <Card hover={false} className="p-6 lg:col-span-2">
                <h3 className="text-sm font-semibold text-surface-700 mb-4">Budget vs Spent</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetChartData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickFormatter={v => `₹${(v / 1000000).toFixed(0)}M`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={v => formatCurrency(v)} />
                      <Bar dataKey="Allocated" fill="#2563eb" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Spent" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap items-center gap-5 mt-4 text-xs">
                  <span className="text-surface-500">Allocated: <span className="text-surface-800 font-bold">{formatCurrency(totalAllocated)}</span></span>
                  <span className="text-surface-500">Spent: <span className="text-red-600 font-bold">{formatCurrency(totalSpent)}</span></span>
                  <span className="text-surface-500">Utilization: <span className="text-amber-600 font-bold">{budgetUsage}%</span></span>
                </div>
              </Card>

              <Card hover={false} className="p-6 lg:col-span-3">
                <h3 className="text-sm font-semibold text-surface-700 mb-4">Project Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    ['Plot ID', project.plot_id], ['Area', `${project.area_size} ${project.area_unit}`],
                    ['Location', project.location], ['Deadline', formatDate(project.deadline)],
                    ['Status', STATUS_LABELS[project.status]], ['Current Stage', project.current_stage],
                    ['Created', formatDate(project.created_at)], ['Compliance', `${project.compliance_score}%`],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-surface-50 border border-surface-100 rounded-xl p-3">
                      <p className="text-[10px] text-surface-400 uppercase tracking-wider font-medium mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-surface-800">{val || 'N/A'}</p>
                    </div>
                  ))}
                </div>
                {project.description && (
                  <div className="mt-4 pt-4 border-t border-surface-100">
                    <p className="text-xs text-surface-400 font-medium mb-1">Description</p>
                    <p className="text-sm text-surface-600">{project.description}</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Milestones */}
          {tab === 1 && (
            <Card hover={false} className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-surface-700">Milestone Checklist</h3>
                {project.status !== 'rejected' && <Button size="sm" icon={CheckCircle2} onClick={() => setShowMilestoneModal(true)}>Add Milestone</Button>}
              </div>
              <div className="space-y-2">
                {milestones.map((ms, i) => (
                  <motion.div
                    key={ms.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors group"
                  >
                    <button onClick={() => toggleMilestone(ms.id)} className="shrink-0">
                      {ms.completed ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : (
                        <Circle size={20} className="text-surface-300 group-hover:text-primary-400 transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${ms.completed ? 'text-surface-400 line-through' : 'text-surface-800'}`}>{ms.title}</p>
                      {ms.target_date && <p className="text-[10px] text-surface-400">Target: {formatDate(ms.target_date)}</p>}
                    </div>
                    {ms.completed && ms.completed_at && (
                      <Badge color="success" size="xs">Done {formatDate(ms.completed_at)}</Badge>
                    )}
                  </motion.div>
                ))}
                {milestones.length === 0 && <p className="text-sm text-surface-400 text-center py-8">No milestones yet</p>}
              </div>
              <div className="mt-5 pt-4 border-t border-surface-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-surface-400 font-medium">{milestones.filter(m => m.completed).length} of {milestones.length} completed</span>
                  <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${milestones.length ? (milestones.filter(m => m.completed).length / milestones.length * 100) : 0}%` }} />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Budget */}
          {tab === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card hover={false} className="p-6">
                <h3 className="text-sm font-semibold text-surface-700 mb-4">Budget Breakdown</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetChartData} layout="vertical" barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickFormatter={v => `₹${(v / 1000000).toFixed(0)}M`} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} width={80} />
                      <Tooltip contentStyle={tooltipStyle} formatter={v => formatCurrency(v)} />
                      <Bar dataKey="Allocated" fill="#2563eb" radius={[0, 6, 6, 0]} barSize={14} />
                      <Bar dataKey="Spent" fill="#ef4444" radius={[0, 6, 6, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card hover={false} className="p-6">
                <h3 className="text-sm font-semibold text-surface-700 mb-4">Budget Details</h3>
                <div className="space-y-3">
                  {budgetEntries.map(b => {
                    const pct = b.allocated ? Math.round((b.spent / b.allocated) * 100) : 0
                    return (
                      <div key={b.id} className="p-3 bg-surface-50 border border-surface-100 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-surface-800">{b.category}</span>
                          <span className={`text-xs font-bold ${pct > 90 ? 'text-red-600' : pct > 70 ? 'text-amber-600' : 'text-emerald-600'}`}>{pct}% used</span>
                        </div>
                        <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden mb-2">
                          <div className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-surface-400">
                          <span>Allocated: {formatCurrency(b.allocated)}</span>
                          <span>Spent: {formatCurrency(b.spent)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* Progress Gallery */}
          {tab === 3 && (
            <Card hover={false} className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-surface-700">Construction Progress Timeline</h3>
                <Button size="sm" icon={Camera} onClick={() => navigate('/monitoring')}>Add Update</Button>
              </div>
              {images.length > 0 ? (
                <div className="space-y-3">
                  {images.map((img, i) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex gap-4 p-4 bg-surface-50 border border-surface-100 rounded-xl"
                    >
                      <div className="w-24 h-24 bg-surface-200 rounded-xl flex items-center justify-center shrink-0">
                        <Camera size={22} className="text-surface-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-semibold text-surface-800">{img.remarks}</p>
                          {img.ai_analysis && (
                            <Badge color={img.ai_analysis.risk_level === 'Low' ? 'success' : img.ai_analysis.risk_level === 'Medium' ? 'warning' : 'danger'} size="xs">
                              {img.ai_analysis.risk_level} Risk
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-surface-400">
                          <span>📅 {formatDateTime(img.captured_at)}</span>
                          {img.location_name && <span>📍 {img.location_name}</span>}
                          {img.ai_analysis && <span>🤖 Stage: {img.ai_analysis.current_stage} ({img.ai_analysis.completion_percentage}%)</span>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera size={38} className="text-surface-300 mx-auto mb-3" />
                  <p className="text-surface-400 font-medium">No progress images yet</p>
                  <p className="text-xs text-surface-300 mt-1">Field officers can upload construction photos</p>
                </div>
              )}
            </Card>
          )}

          {/* AI Analysis */}
          {tab === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card hover={false} className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BrainCircuit size={17} className="text-indigo-500" />
                  <h3 className="text-sm font-semibold text-surface-700">Latest AI Analysis</h3>
                </div>
                {latestAnalysis ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <p className="text-xs text-surface-400 mb-1 font-medium uppercase tracking-wide">Current Stage</p>
                      <p className="text-xl font-bold text-surface-800">{latestAnalysis.current_stage}</p>
                      <p className="text-sm text-indigo-600 font-semibold mt-1">{latestAnalysis.completion_percentage}% complete</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['Previous Stage', latestAnalysis.previous_stage, null],
                        ['Next Stage', latestAnalysis.next_stage, null],
                        ['Risk Level', latestAnalysis.risk_level, RISK_COLORS[latestAnalysis.risk_level]],
                        ['Confidence', `${Math.round(latestAnalysis.confidence * 100)}%`, null],
                      ].map(([label, value, color]) => (
                        <div key={label} className="p-3 bg-surface-50 border border-surface-100 rounded-xl">
                          <p className="text-[10px] text-surface-400 uppercase tracking-wide font-medium">{label}</p>
                          <p className="text-sm font-bold mt-0.5" style={color ? { color } : { color: '#1e293b' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                    {latestAnalysis.details && (
                      <div className="p-3 bg-surface-50 border border-surface-100 rounded-xl">
                        <p className="text-[10px] text-surface-400 uppercase tracking-wide font-medium mb-1">Analysis Details</p>
                        <p className="text-sm text-surface-600">{latestAnalysis.details}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BrainCircuit size={38} className="text-surface-300 mx-auto mb-3" />
                    <p className="text-surface-400 font-medium">No AI analysis available</p>
                    <p className="text-xs text-surface-300 mt-1">Upload progress images to get AI-powered analysis</p>
                  </div>
                )}
              </Card>

              <Card hover={false} className="p-6">
                <h3 className="text-sm font-semibold text-surface-700 mb-5">Compliance Score</h3>
                <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40 mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                      <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={getComplianceColor(project.compliance_score)} strokeWidth="3.5" strokeDasharray={`${project.compliance_score}, 100`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-surface-800">{project.compliance_score}%</span>
                      <span className="text-[10px] text-surface-400">Compliance</span>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold ${project.compliance_score >= 80 ? 'text-emerald-600' : project.compliance_score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                    {project.compliance_score >= 80 ? 'Excellent' : project.compliance_score >= 60 ? 'Needs Attention' : 'Critical'}
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Documents */}
          {tab === 5 && (
            <Card hover={false} className="p-6">
              <h3 className="text-sm font-semibold text-surface-700 mb-5">Project Documents</h3>
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 bg-surface-50 border border-surface-100 rounded-xl hover:bg-surface-100 transition-colors">
                      <div className="w-10 h-10 bg-primary-100 border border-primary-200 rounded-xl flex items-center justify-center shrink-0">
                        <FileText size={17} className="text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-surface-800 truncate">{doc.file_name}</p>
                        <p className="text-xs text-surface-400">{doc.doc_type} • {formatDate(doc.created_at)} • {Math.round((doc.file_size || 0) / 1024)}KB</p>
                      </div>
                      <Badge color="gray" size="xs">{doc.doc_type}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={38} className="text-surface-300 mx-auto mb-3" />
                  <p className="text-surface-400 font-medium">No documents uploaded yet</p>
                </div>
              )}
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Add Milestone Modal */}
      <Modal isOpen={showMilestoneModal} onClose={() => setShowMilestoneModal(false)} title="Add Milestone">
        <div className="space-y-4">
          <Input label="Milestone Title" placeholder="e.g., Foundation Complete" value={newMilestone.title} onChange={e => setNewMilestone(prev => ({ ...prev, title: e.target.value }))} />
          <Input label="Target Date" type="date" value={newMilestone.target_date} onChange={e => setNewMilestone(prev => ({ ...prev, target_date: e.target.value }))} />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowMilestoneModal(false)}>Cancel</Button>
            <Button onClick={handleAddMilestone} disabled={!newMilestone.title}>Add Milestone</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}
