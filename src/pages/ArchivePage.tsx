import { useState, useMemo } from 'react'
import { Search, Filter } from 'lucide-react'
import { ArchiveCard } from '@/components/archive/ArchiveCard'
import { Spinner } from '@/components/ui/Spinner'
import { useArchive } from '@/hooks/useArchive'
import { useClasses } from '@/hooks/useClasses'
import type { MaterialType } from '@/config/constants'

export function ArchivePage() {
  const { materials, loading, deleteMaterial } = useArchive()
  const { classes } = useClasses()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<MaterialType | ''>('')
  const [classFilter, setClassFilter] = useState('')

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const matchSearch =
        !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.topic.toLowerCase().includes(search.toLowerCase())
      const matchType = !typeFilter || m.type === typeFilter
      const matchClass = !classFilter || m.classId === classFilter
      return matchSearch && matchType && matchClass
    })
  }, [materials, search, typeFilter, classFilter])

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Acervo</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          {materials.length} {materials.length === 1 ? 'material salvo' : 'materiais salvos'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título ou tema..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as MaterialType | '')}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos os tipos</option>
          <option value="lesson_plan">Planos de Aula</option>
          <option value="activities">Atividades</option>
          <option value="slides">Slides</option>
        </select>

        {classes.length > 0 && (
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todas as turmas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">📚</p>
          <p className="font-medium text-slate-600">Nenhum material encontrado</p>
          <p className="text-sm mt-1">Os materiais gerados no Planejador são salvos aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((material) => (
            <ArchiveCard
              key={material.id}
              material={material}
              onDelete={deleteMaterial}
            />
          ))}
        </div>
      )}
    </div>
  )
}
