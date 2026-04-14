import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiFetch } from '@/services/api.service'
import type { TeacherClass } from '@/types/teacher.types'

export function useClasses() {
  const { currentUser } = useAuth()
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!currentUser) return
    try {
      const data = await apiFetch<TeacherClass[]>('/api/data/classes')
      setClasses(data)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => { fetch() }, [fetch])

  const addClass = async (data: Omit<TeacherClass, 'id'>) => {
    const res = await apiFetch<{ id: string }>('/api/data/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    setClasses((prev) => [...prev, { id: res.id, ...data }])
  }

  const updateClass = async (id: string, data: Partial<TeacherClass>) => {
    await apiFetch(`/api/data/classes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }

  const deleteClass = async (id: string) => {
    await apiFetch(`/api/data/classes/${id}`, { method: 'DELETE' })
    setClasses((prev) => prev.filter((c) => c.id !== id))
  }

  return { classes, loading, addClass, updateClass, deleteClass, refetch: fetch }
}
