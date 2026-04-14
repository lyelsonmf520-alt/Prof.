import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from './AuthContext'
import type { TeacherProfile } from '@/types/teacher.types'

interface TeacherContextValue {
  profile: TeacherProfile | null
  loadingProfile: boolean
  updateProfile: (data: Partial<Omit<TeacherProfile, 'uid' | 'createdAt'>>) => Promise<void>
}

const TeacherContext = createContext<TeacherContextValue | null>(null)

export function TeacherProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth()
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setProfile(null)
      setLoadingProfile(false)
      return
    }

    const ref = doc(db, 'users', currentUser.uid, 'data', 'profile')
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const data = snap.data()
        setProfile({
          uid: currentUser.uid,
          name: data.name || currentUser.displayName || '',
          subject: data.subject || '',
          school: data.school || '',
          avatarUrl: data.avatarUrl || currentUser.photoURL || null,
          createdAt: data.createdAt?.toDate() || new Date(),
        })
      } else {
        // Initialize profile from Google data
        const initial: Omit<TeacherProfile, 'uid'> = {
          name: currentUser.displayName || '',
          subject: '',
          school: '',
          avatarUrl: currentUser.photoURL || null,
          createdAt: new Date(),
        }
        setProfile({ uid: currentUser.uid, ...initial })
      }
      setLoadingProfile(false)
    })
  }, [currentUser])

  const updateProfile = async (data: Partial<Omit<TeacherProfile, 'uid' | 'createdAt'>>) => {
    if (!currentUser) return
    const ref = doc(db, 'users', currentUser.uid, 'data', 'profile')
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true })
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
