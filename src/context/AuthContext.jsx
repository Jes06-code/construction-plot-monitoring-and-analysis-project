import { createContext, useContext, useState, useEffect } from 'react'
import { ROLES, ROLE_LABELS } from '../utils/constants'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(authUser) {
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    }

    if (!data) {
      // If profile doesn't exist, create it
      const emailMap = {
        'industrialops@gmail.com': ROLES.ADMIN,
        'contractor@gmail.com': ROLES.CONTRACTOR,
        'government@gmail.com': ROLES.GOVERNMENT_AUTHORITY,
        'fieldofficer@gmail.com': ROLES.FIELD_OFFICER,
      }
      const role = emailMap[authUser.email] || ROLES.CONTRACTOR // Default to contractor if not in map
      const fullName = authUser.email.split('@')[0].toUpperCase()

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          email: authUser.email,
          full_name: fullName,
          role: role,
          organization: 'Industrial Platform',
        })
        .select('*')
        .single()
      
      if (!createError) data = newProfile
    }

    if (data) {
      setUser({ ...authUser, ...data })
    } else {
      setUser(authUser)
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setLoading(false)
      throw error
    }
    return data.user
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const isAdmin = user?.role === ROLES.ADMIN
  const isCompanyRep = user?.role === ROLES.COMPANY_REP
  const isFieldOfficer = user?.role === ROLES.FIELD_OFFICER
  const isContractor = user?.role === ROLES.CONTRACTOR
  const isGovernmentAuthority = user?.role === ROLES.GOVERNMENT_AUTHORITY

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      isAdmin, isCompanyRep, isFieldOfficer, isContractor, isGovernmentAuthority,
      roleLabel: user ? ROLE_LABELS[user.role] : '',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
