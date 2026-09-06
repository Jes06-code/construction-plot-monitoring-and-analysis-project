import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo Area */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-surface-800 tracking-tight">IndustrialOps</h1>
          <p className="text-sm text-surface-500 mt-2 font-medium">Monitoring & Analytics Platform</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-3xl border border-surface-200 shadow-xl p-10">
          <h2 className="text-xl font-bold text-surface-800 mb-8">Sign in</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-surface-50 border border-surface-100 rounded-2xl px-6 py-4 text-sm text-surface-800 placeholder-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  {showPwd ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-50 border border-surface-100 rounded-2xl px-6 py-4 text-sm text-surface-800 placeholder-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-2xl px-5 py-4"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" loading={loading} className="w-full py-4 rounded-2xl text-base font-bold shadow-lg shadow-primary-500/20" size="lg">
              Continue
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-xs text-surface-400">
              Authorized personnel only. For assistance, contact industrialops@gmail.com
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
