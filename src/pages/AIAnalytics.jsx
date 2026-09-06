import { motion } from 'framer-motion'
import { TrendingUp, AlertTriangle, Activity, BrainCircuit } from 'lucide-react'
import { useData } from '../context/DataContext'
import Card, { StatCard } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { RISK_COLORS, CONSTRUCTION_STAGES } from '../utils/constants'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function AIAnalytics() {
  const { projects, progressImages } = useData()

  const allAnalyses = progressImages.filter(img => img.ai_analysis).map(img => img.ai_analysis)

  const stageDistribution = CONSTRUCTION_STAGES.map(stage => ({
    name: stage.length > 12 ? stage.slice(0, 12) + '…' : stage,
    count: projects.filter(p => p.current_stage === stage).length,
  })).filter(d => d.count > 0)

  const riskDistribution = [
    { name: 'Low', value: allAnalyses.filter(a => a.risk_level === 'Low').length, color: '#059669' },
    { name: 'Medium', value: allAnalyses.filter(a => a.risk_level === 'Medium').length, color: '#d97706' },
    { name: 'High', value: allAnalyses.filter(a => a.risk_level === 'High').length, color: '#dc2626' },
  ].filter(d => d.value > 0)

  const avgCompletion = projects.length ? Math.round(projects.reduce((s, p) => s + (p.completion_percentage || 0), 0) / projects.length) : 0
  const highRiskCount = projects.filter(p => {
    const imgs = progressImages.filter(img => img.project_id === p.id && img.ai_analysis?.risk_level === 'High')
    return imgs.length > 0
  }).length

  const radarData = [
    { metric: 'Completion', value: avgCompletion },
    { metric: 'Compliance', value: projects.length ? Math.round(projects.reduce((s, p) => s + (p.compliance_score || 0), 0) / projects.length) : 0 },
    { metric: 'On-Time', value: Math.round((projects.filter(p => p.status !== 'delayed').length / Math.max(projects.length, 1)) * 100) },
    { metric: 'AI Coverage', value: Math.round((progressImages.filter(img => img.ai_analysis).length / Math.max(progressImages.length, 1)) * 100) },
    { metric: 'Documentation', value: 80 },
  ]

  const tooltipStyle = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', color: '#334155' }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-surface-800">AI Analytics Dashboard</h1>
        <p className="text-sm text-surface-500 mt-1">AI-powered insights across all projects</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BrainCircuit} label="AI Analyses" value={allAnalyses.length} color="secondary" />
        <StatCard icon={TrendingUp} label="Avg Completion" value={`${avgCompletion}%`} color="primary" />
        <StatCard icon={AlertTriangle} label="High Risk Projects" value={highRiskCount} color="danger" />
        <StatCard icon={Activity} label="Active Monitoring" value={projects.filter(p => p.status === 'in_progress').length} color="success" />
      </motion.div>

      {/* Charts */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card hover={false} className="p-6">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Stage Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Projects" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover={false} className="p-6">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Risk Assessment Distribution</h3>
          <div className="h-[250px]">
            {riskDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {riskDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend formatter={val => <span style={{ color: '#64748b', fontSize: '12px' }}>{val}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-surface-400 text-sm">No risk data available</div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Radar + Project Analysis */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card hover={false} className="p-6">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Overall Health Metrics</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <Radar name="Score" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover={false} className="p-6">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Project-wise AI Summary</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {projects.map(project => {
              const projectImages = progressImages.filter(img => img.project_id === project.id && img.ai_analysis)
              const latest = projectImages[0]?.ai_analysis
              return (
                <div key={project.id} className="p-3 bg-surface-50 border border-surface-100 rounded-xl">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-surface-800 truncate">{project.title}</p>
                      <p className="text-xs text-surface-400 font-mono">{project.project_code}</p>
                    </div>
                    {latest ? (
                      <Badge color={latest.risk_level === 'Low' ? 'success' : latest.risk_level === 'Medium' ? 'warning' : 'danger'} size="xs">
                        {latest.risk_level}
                      </Badge>
                    ) : (
                      <Badge color="gray" size="xs">No Data</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${project.completion_percentage}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-surface-600">{project.completion_percentage}%</span>
                  </div>
                  {latest && (
                    <p className="text-xs text-surface-400 mt-1.5">Stage: {latest.current_stage} → {latest.next_stage}</p>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
