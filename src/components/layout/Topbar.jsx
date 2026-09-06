import { useNavigate } from 'react-router-dom'
import { Bell, Menu, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'

export default function Topbar({ onMenuClick }) {
  const { user, roleLabel } = useAuth()
  const { getUnreadCount } = useData()
  const navigate = useNavigate()
  const unread = getUnreadCount(user?.id)

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-surface-100 text-surface-500 hover:text-surface-700 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-2 bg-surface-100 border border-surface-200 rounded-xl px-3 py-2 min-w-[240px]">
          <Search size={15} className="text-surface-400 shrink-0" />
          <input
            type="text"
            placeholder="Search projects, reports..."
            className="bg-transparent border-none outline-none text-sm text-surface-700 placeholder-surface-400 w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl hover:bg-surface-100 text-surface-500 hover:text-surface-700 transition-colors"
        >
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-danger-500 rounded-full">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
        <div className="hidden md:flex items-center gap-3 pl-3 border-l border-surface-200">
          <div className="text-right">
            <p className="text-sm font-medium text-surface-800">{user?.full_name}</p>
            <p className="text-[10px] text-surface-400">{roleLabel}</p>
          </div>
          <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center text-sm font-bold">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}
