import { motion } from 'framer-motion'
import { Bell, CheckCheck, AlertTriangle, FileText, Calendar, Info } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { formatDateTime } from '../utils/helpers'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }

const TYPE_ICONS = {
  deadline: Calendar,
  delay: AlertTriangle,
  missing_upload: FileText,
  compliance: AlertTriangle,
  info: Info,
}

const TYPE_COLORS = {
  deadline: 'warning',
  delay: 'danger',
  missing_upload: 'primary',
  compliance: 'danger',
  info: 'secondary',
}

export default function Notifications() {
  const { user } = useAuth()
  const { getUserNotifications, markNotificationRead, markAllNotificationsRead } = useData()

  const notifications = getUserNotifications(user?.id)
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Notifications</h1>
          <p className="text-sm text-surface-500 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" icon={CheckCheck} onClick={markAllNotificationsRead}>
            Mark All Read
          </Button>
        )}
      </motion.div>

      <motion.div variants={item} className="space-y-2">
        {notifications.map((notif) => {
          const IconComp = TYPE_ICONS[notif.type] || Info
          const color = TYPE_COLORS[notif.type] || 'gray'

          const iconBg = {
            warning: 'bg-amber-100',
            danger: 'bg-red-100',
            primary: 'bg-primary-100',
            secondary: 'bg-indigo-100',
            gray: 'bg-surface-100',
          }[color]

          const iconColor = {
            warning: 'text-amber-600',
            danger: 'text-red-600',
            primary: 'text-primary-600',
            secondary: 'text-indigo-600',
            gray: 'text-surface-400',
          }[color]

          return (
            <motion.div key={notif.id} variants={item}>
              <Card
                hover={false}
                onClick={() => !notif.read && markNotificationRead(notif.id)}
                className={`p-4 cursor-pointer transition-all ${!notif.read ? 'border-primary-200 bg-primary-50/50' : ''}`}
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <IconComp size={17} className={iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${!notif.read ? 'text-surface-800' : 'text-surface-500'}`}>{notif.title}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-primary-500" />}
                        <Badge color={color} size="xs">{notif.type?.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-surface-500 mt-0.5">{notif.message}</p>
                    <p className="text-[10px] text-surface-400 mt-1.5">{formatDateTime(notif.created_at)}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}

        {notifications.length === 0 && (
          <div className="text-center py-16">
            <Bell size={40} className="text-surface-300 mx-auto mb-3" />
            <p className="text-surface-400 font-medium">No notifications</p>
            <p className="text-xs text-surface-300 mt-1">You're all caught up!</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
