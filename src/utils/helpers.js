import { format, differenceInDays, isPast } from 'date-fns'

export function formatDate(date) {
  if (!date) return '—'
  return format(new Date(date), 'MMM dd, yyyy')
}

export function formatDateTime(date) {
  if (!date) return '—'
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

export function getDeadlineStatus(deadline) {
  if (!deadline) return 'green'
  const days = differenceInDays(new Date(deadline), new Date())
  if (days < 0) return 'red'
  if (days <= 14) return 'yellow'
  return 'green'
}

export function getDaysRemaining(deadline) {
  if (!deadline) return null
  const days = differenceInDays(new Date(deadline), new Date())
  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days === 0) return 'Due today'
  return `${days} days left`
}

export function generateProjectCode() {
  const year = new Date().getFullYear()
  const num = String(Math.floor(Math.random() * 9000) + 1000)
  return `PRJ-${year}-${num}`
}

export function generatePlotId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const l = letters[Math.floor(Math.random() * 26)]
  const num = String(Math.floor(Math.random() * 900) + 100)
  return `PLT-${l}${num}`
}

export function formatCurrency(amount) {
  if (amount == null) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getComplianceColor(score) {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

export function truncate(str, len = 50) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
