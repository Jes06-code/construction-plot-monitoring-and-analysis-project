export default function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-sm font-medium text-surface-700">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
            <Icon size={16} />
          </div>
        )}
        <input
          className={`w-full bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-800 placeholder-surface-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all duration-200
            ${Icon ? 'pl-10' : ''} ${error ? 'border-red-400 focus:ring-red-400/30' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Select({ label, error, options = [], placeholder, className = '', ...props }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-sm font-medium text-surface-700">{label}</label>}
      <select
        className={`w-full bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-800
          focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all duration-200
          ${error ? 'border-red-400' : ''}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-sm font-medium text-surface-700">{label}</label>}
      <textarea
        className={`w-full bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-800 placeholder-surface-400
          focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all duration-200 min-h-[100px] resize-y
          ${error ? 'border-red-400 focus:ring-red-400/30' : ''}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
