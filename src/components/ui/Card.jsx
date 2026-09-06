import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = true, glow = false, onClick, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -1 } : {}}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`bg-white border border-surface-200 rounded-xl shadow-sm transition-all duration-200
        ${hover ? 'hover:border-primary-300 hover:shadow-md cursor-pointer' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StatCard({ icon: Icon, label, value, trend, color = 'primary', onClick }) {
  const bgColorMap = {
    primary: 'bg-primary-50 border-primary-100',
    success: 'bg-emerald-50 border-emerald-100',
    warning: 'bg-amber-50 border-amber-100',
    danger: 'bg-red-50 border-red-100',
    secondary: 'bg-indigo-50 border-indigo-100',
  }
  const iconBgMap = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-emerald-100 text-emerald-600',
    warning: 'bg-amber-100 text-amber-600',
    danger: 'bg-red-100 text-red-600',
    secondary: 'bg-indigo-100 text-indigo-600',
  }
  const valueColorMap = {
    primary: 'text-primary-700',
    success: 'text-emerald-700',
    warning: 'text-amber-700',
    danger: 'text-red-700',
    secondary: 'text-indigo-700',
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`border rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md ${bgColorMap[color]}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconBgMap[color]}`}>
          {Icon && <Icon size={20} />}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
            trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold ${valueColorMap[color]}`}>{value}</p>
      <p className="text-sm text-surface-500 mt-1 font-medium">{label}</p>
    </motion.div>
  )
}
