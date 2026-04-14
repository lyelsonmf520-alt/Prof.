import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { apiFetch } from '@/services/api.service'
import type { TeacherProfile } from '@/types/teacher.types'

interface TeacherContextValue {
  profile: TeacherProfile | null
  loadingProfile: boolean
  updateProfile: (data: Partial<Omit<TeacherProfile, 'uid' | 'createdAt'>>) => Promise<void>
}

const TeacherContext = createContext<TeacherContextValue | null>(null)

export function TeacherProvider({ children }: { children: ReactNode }) {
  const { currentUser, token } = useAuth()
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    if (!currentUser || !token) {
      setProfile(null)
      setLoadingProfile(false)
      return
    }

    apiFetch<{ uid: string; name: string; subject: string; school: string; avatarUrl: string | null }>('/api/data/profile')
      .then((data) => {
        setProfile({
          uid: data.uid,
          name: data.name || currentUser.name || '',
          subject: data.subject || '',
          school: data.school || '',
          avatarUrl: data.avatarUrl || null,
          createdAt: new Date(),
        })
      })
      .catch(() => {
        // Fallback to auth user data
        setProfile({
          uid: currentUser.uid,
          name: currentUser.name || '',
          subject: currentUser.subject || '',
          school: currentUser.school || '',
          avatarUrl: currentUser.avatarUrl || null,
          createdAt: new Date(),
        })
      })
      .finally(() => setLoadingProfile(false))
  }, [currentUser, token])

  const updateProfile = async (data: Partial<Omit<TeacherProfile, 'uid' | 'createdAt'>>) => {
    await apiFetch('/api/data/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    setProfile((prev) => (prev ? { ...prev, ...data } : prev))
  }

  return (
    <TeacherContext.Provider value={{ profile, loadingProfile, updateProfile }}>
      {children}
    </TeacherContext.Provider>
  )
}

export function useTeacher() {
  const ctx = useContext(TeacherContext)
  if (!ctx) throw new Error('useTeacher must be used within TeacherProvider')
  return ctx
}
