import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, AlertTriangle, TrendingUp, Calendar } from 'lucide-react'
import { useData } from '../context/DataContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { formatDate, formatCurrency, getDeadlineStatus, getDaysRemaining } from '../utils/helpers'
import { STATUS_LABELS } from '../utils/constants'
import { generateProjectPDF, generateProjectExcel } from '../utils/reportGenerator'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function Reports() {
  const { projects, getProjectMilestones, getProjectBudget } = useData()
  const [reportType, setReportType] = useState('progress')

  const delayedProjects = projects.filter(p => p.status === 'delayed' || getDeadlineStatus(p.deadline) === 'red')
  const lowCompliance = projects.filter(p => (p.compliance_score || 0) < 70)
  const nearDeadline = projects.filter(p => getDeadlineStatus(p.deadline) === 'yellow')

  const handleExportPDF = (project) => {
    const milestones = getProjectMilestones(project.id)
    const budget = getProjectBudget(project.id)
    generateProjectPDF(project, milestones, budget)
  }

  const handleExportExcel = (project) => {
    const milestones = getProjectMilestones(project.id)
    const budget = getProjectBudget(project.id)
    generateProjectExcel(project, milestones, budget)
  }

  const handleBulkExport = (format) => {
    projects.forEach(project => {
      const milestones = getProjectMilestones(project.id)
      const budget = getProjectBudget(project.id)
      if (format === 'pdf') generateProjectPDF(project, milestones, budget)
      else generateProjectExcel(project, milestones, budget)
    })
  }

  const tabs = [
    { key: 'progress', label: 'Progress Reports', icon: TrendingUp },
    { key: 'compliance', label: 'Compliance Reports', icon: FileText },
    { key: 'delays', label: 'Delay Warnings', icon: AlertTriangle },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Reports & Analytics</h1>
          <p className="text-sm text-surface-500 mt-1">Generate and export project reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={Download} onClick={() => handleBulkExport('pdf')}>Export All PDF</Button>
          <Button variant="secondary" size="sm" icon={Download} onClick={() => handleBulkExport('excel')}>Export All Excel</Button>
        </div>
      </motion.div>

      {/* Report Type Tabs */}
      <motion.div variants={item} className="flex gap-2 bg-surface-100 p-1 rounded-xl border border-surface-200 w-fit">
        {tabs.map(rt => (
          <button
            key={rt.key}
            onClick={() => setReportType(rt.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              reportType === rt.key
                ? 'bg-white text-surface-800 shadow-sm border border-surface-200'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            <rt.icon size={15} />
            {rt.label}
          </button>
        ))}
      </motion.div>

      {/* Progress Reports */}
      {reportType === 'progress' && (
        <motion.div variants={item} className="space-y-3">
          {projects.map(project => (
            <Card key={project.id} hover={false} className="p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold text-surface-800">{project.title}</h3>
                    <Badge color={project.status === 'in_progress' ? 'success' : project.status === 'delayed' ? 'danger' : 'warning'} size="xs" dot>
                      {STATUS_LABELS[project.status]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-surface-400 mt-1">
                    <span className="font-mono">{project.project_code}</span>
                    <span>Stage: {project.current_stage}</span>
                    <span>Deadline: {formatDate(project.deadline)}</span>
                    <span>Investment: {formatCurrency(project.investment_commitment)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden max-w-[200px]">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${project.completion_percentage}%` }} />
                    </div>
                    <span className="text-xs font-bold text-surface-700">{project.completion_percentage}%</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="secondary" size="sm" icon={Download} onClick={() => handleExportPDF(project)}>PDF</Button>
                  <Button variant="secondary" size="sm" icon={Download} onClick={() => handleExportExcel(project)}>Excel</Button>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Compliance Reports */}
      {reportType === 'compliance' && (
        <motion.div variants={item} className="space-y-3">
          {lowCompliance.length > 0 ? (
            <>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                  <span className="text-sm font-medium text-amber-700">{lowCompliance.length} project(s) below compliance threshold (&lt;70%)</span>
                </div>
              </div>
              {lowCompliance.map(project => (
                <Card key={project.id} hover={false} className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-surface-800">{project.title}</h3>
                      <p className="text-xs text-surface-400 mt-0.5">{project.project_code} • {project.location}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-2xl font-bold ${project.compliance_score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{project.compliance_score}%</p>
                      <p className="text-xs text-surface-400">Compliance Score</p>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          ) : (
            <Card hover={false} className="p-8 text-center">
              <FileText size={36} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-emerald-700 font-semibold">All projects meet compliance standards</p>
            </Card>
          )}

          <h3 className="text-sm font-semibold text-surface-700 pt-4">All Projects Compliance Overview</h3>
          {projects.map(project => (
            <Card key={project.id} hover={false} className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-surface-700 font-medium flex-1 min-w-0 truncate">{project.title}</span>
                <div className="flex items-center gap-2 w-48 shrink-0">
                  <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${project.compliance_score >= 80 ? 'bg-emerald-500' : project.compliance_score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${project.compliance_score}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-surface-600 w-10 text-right">{project.compliance_score}%</span>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Delay Warnings */}
      {reportType === 'delays' && (
        <motion.div variants={item} className="space-y-3">
          {delayedProjects.length > 0 || nearDeadline.length > 0 ? (
            <>
              {delayedProjects.length > 0 && (
                <>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-600 shrink-0" />
                      <span className="text-sm font-medium text-red-700">{delayedProjects.length} project(s) are delayed or overdue</span>
                    </div>
                  </div>
                  {delayedProjects.map(project => (
                    <Card key={project.id} hover={false} className="p-5 border-red-100">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-surface-800">{project.title}</h3>
                          <p className="text-xs text-surface-400 mt-0.5">{project.project_code} • {project.location}</p>
                          <p className="text-xs text-red-600 mt-1.5 font-semibold">{getDaysRemaining(project.deadline)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-surface-800">{project.completion_percentage}%</p>
                          <p className="text-xs text-surface-400">Completion</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </>
              )}

              {nearDeadline.length > 0 && (
                <>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mt-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-amber-600 shrink-0" />
                      <span className="text-sm font-medium text-amber-700">{nearDeadline.length} project(s) nearing deadline</span>
                    </div>
                  </div>
                  {nearDeadline.map(project => (
                    <Card key={project.id} hover={false} className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-surface-800">{project.title}</h3>
                          <p className="text-xs text-surface-400 mt-0.5 font-mono">{project.project_code}</p>
                        </div>
                        <span className="text-sm font-semibold text-amber-600 shrink-0">{getDaysRemaining(project.deadline)}</span>
                      </div>
                    </Card>
                  ))}
                </>
              )}
            </>
          ) : (
            <Card hover={false} className="p-8 text-center">
              <Calendar size={36} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-emerald-700 font-semibold">No delays or critical deadlines detected</p>
            </Card>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
