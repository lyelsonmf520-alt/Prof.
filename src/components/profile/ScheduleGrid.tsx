import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getCollection, addToCollection, deleteFromCollection } from '@/services/firestore.service'
import type { TeacherClass, ScheduleSlot } from '@/types/teacher.types'

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
const DAY_INDICES = [1, 2, 3, 4, 5]
const PERIODS = ['1º', '2º', '3º', '4º', '5º', '6º']

interface ScheduleGridProps {
  classes: TeacherClass[]
}

export function ScheduleGrid({ classes }: ScheduleGridProps) {
  const { currentUser } = useAuth()
  const [slots, setSlots] = useState<ScheduleSlot[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')

  useEffect(() => {
    if (!currentUser) return
    getCollection<ScheduleSlot>(currentUser.uid, 'schedule').then(setSlots)
  }, [currentUser])

  const getSlot = (dayOfWeek: number, period: number) =>
    slots.find((s) => s.dayOfWeek === dayOfWeek && s.period === period)

  const handleCellClick = async (dayOfWeek: number, period: number) => {
    if (!currentUser) return
    const existing = getSlot(dayOfWeek, period)

    if (existing) {
      // Remove slot
      await deleteFromCollection(currentUser.uid, 'schedule', existing.id)
      setSlots((prev) => prev.filter((s) => s.id !== existing.id))
    } else if (selectedClass) {
      // Add slot
      const id = await addToCollection(currentUser.uid, 'schedule', {
        dayOfWeek,
        period,
        classId: selectedClass,
      })
      setSlots((prev) => [...prev, { id, dayOfWeek, period, classId: selectedClass }])
    }
  }

  const getClassById = (id: string) => classes.find((c) => c.id === id)

  return (
    <div className="space-y-4">
      {/* Class selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-slate-700">Turma ativa:</span>
        <div className="flex gap-2 flex-wrap">
          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls.id === selectedClass ? '' : cls.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedClass === cls.id
                  ? 'text-white border-transparent'
                  : 'text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
              style={selectedClass === cls.id ? { backgroundColor: cls.color, borderColor: cls.color } : {}}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cls.color }}
              />
              {cls.name}
            </button>
          ))}
        </div>
        {selectedClass && (
          <span className="text-xs text-slate-500">Clique nas células para atribuir</span>
        )}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-12 py-2 text-xs font-medium text-slate-500 text-center" />
              {DAYS.map((day, i) => (
                <th key={i} className="py-2 text-xs font-medium text-slate-600 text-center px-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period, pi) => (
              <tr key={pi}>
                <td className="py-1 pr-2 text-xs text-slate-400 text-center font-medium">{period}</td>
                {DAY_INDICES.map((dayIdx) => {
                  const slot = getSlot(dayIdx, pi + 1)
                  const cls = slot ? getClassById(slot.classId) : null

                  return (
                    <td key={dayIdx} className="py-1 px-1">
                      <button
                        onClick={() => handleCellClick(dayIdx, pi + 1)}
                        className={`w-full h-10 rounded-lg text-xs font-medium transition-all border ${
                          cls
                            ? 'text-white border-transparent'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-400'
                        }`}
                        style={cls ? { backgroundColor: cls.color } : {}}
                      >
                        {cls ? cls.name.split(' ')[0] : '+'}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
