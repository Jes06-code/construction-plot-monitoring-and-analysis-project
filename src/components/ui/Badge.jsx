export default function Badge({ children, color = 'primary', size = 'sm', dot = false, className = '' }) {
  const colors = {
    primary: 'bg-primary-100 text-primary-700 border-primary-200',
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    secondary: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    gray: 'bg-surface-100 text-surface-600 border-surface-200',
  }
  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }
  const dotColors = {
    primary: 'bg-primary-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    secondary: 'bg-indigo-500',
    gray: 'bg-surface-400',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold border rounded-full ${colors[color]} ${sizes[size]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[color]}`} />}
      {children}
    </span>
  )
}
