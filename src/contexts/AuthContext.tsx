import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { API_BASE_URL } from '@/config/constants'

interface AuthUser {
  uid: string
  email: string
  name: string
  subject: string
  school: string
  avatarUrl: string | null
}

interface AuthContextValue {
  currentUser: AuthUser | null
  loading: boolean
  token: string | null
  signIn: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  signOut: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'prof_raposo_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    // Verify token and load user
    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Token invalid')
        const data = await res.json()
        setCurrentUser(data.user)
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setCurrentUser(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const applyAuth = (newToken: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setCurrentUser(user)
  }

  const signIn = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Falha no login')
    }
    const data = await res.json()
    applyAuth(data.token, data.user)
  }

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Falha no cadastro')
    }
    const data = await res.json()
    applyAuth(data.token, data.user)
  }

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setCurrentUser(null)
  }

  const refreshUser = async () => {
    if (!token) return
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = await res.json()
      setCurrentUser(data.user)
    }
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, token, signIn, register, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
