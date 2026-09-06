import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, FolderPlus, FolderOpen,
  Camera, BrainCircuit, FileBarChart, Bell, LogOut,
  ChevronLeft, ChevronRight, Building2
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects/new', icon: FolderPlus, label: 'New Project', roles: ['admin', 'company_rep', 'contractor', 'field_officer', 'government_authority'] },
  { to: '/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/monitoring', icon: Camera, label: 'Field Monitoring' },
  { to: '/analytics', icon: BrainCircuit, label: 'AI Analytics' },
  { to: '/reports', icon: FileBarChart, label: 'Reports' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout, roleLabel } = useAuth()
  const navigate = useNavigate()

  const filteredItems = navItems.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(user?.role)
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setCollapsed(true)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 h-full z-40 flex flex-col bg-white border-r border-surface-200
          ${collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'} lg:translate-x-0 transition-transform`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-200 shrink-0">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shrink-0">
            <Building2 size={20} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden">
                <h1 className="text-sm font-bold text-surface-800 whitespace-nowrap">IndustrialOps</h1>
                <p className="text-[10px] text-surface-400 whitespace-nowrap">Monitoring Platform</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {filteredItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => window.innerWidth < 1024 && setCollapsed(true)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-surface-600 hover:text-surface-800 hover:bg-surface-100'
                }`
              }
            >
              <item.icon size={18} className="shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-surface-200 p-3 shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-surface-800 truncate">{user?.full_name}</p>
                <p className="text-[10px] text-surface-400 truncate">{roleLabel}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-danger-600 hover:bg-danger-50 transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 items-center justify-center rounded-full bg-white border border-surface-200 text-surface-400 hover:text-surface-700 hover:border-surface-300 transition-colors shadow-sm"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </motion.aside>
    </>
  )
}
