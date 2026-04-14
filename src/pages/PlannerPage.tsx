import { useState } from 'react'
import { BookOpen, ClipboardList, Presentation, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { Spinner } from '@/components/ui/Spinner'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'
import { StreamingText } from '@/components/ui/StreamingText'
import { PlannerInputForm } from '@/components/planner/PlannerInputForm'
import { SlidesPreview } from '@/components/planner/SlidesPreview'
import { useGenerateContent } from '@/hooks/useGenerateContent'
import { useClasses } from '@/hooks/useClasses'
import type { MaterialType } from '@/config/constants'
import type { TeacherClass } from '@/types/teacher.types'

const outputTabs = [
  { id: 'lesson_plan', label: 'Plano de Aula', icon: <BookOpen size={15} /> },
  { id: 'activities', label: 'Atividades', icon: <ClipboardList size={15} /> },
  { id: 'slides', label: 'Slides', icon: <Presentation size={15} /> },
]

export function PlannerPage() {
  const { classes } = useClasses()
  const { status, content, slides, error, generate, reset } = useGenerateContent()
  const [lastType, setLastType] = useState<MaterialType>('lesson_plan')
  const [lastTopic, setLastTopic] = useState('')
  const [activeOutputTab, setActiveOutputTab] = useState<string>('lesson_plan')

  const isLoading = status === 'uploading' || status === 'generating'

  const handleGenerate = async (
    type: MaterialType,
    topic: string,
    cls: TeacherClass | null,
    file?: File
  ) => {
    setLastType(type)
    setLastTopic(topic)
    setActiveOutputTab(type)
    await generate(type, topic, cls, file)
  }

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Planejador com IA</h2>
        <p className="text-slate-500 text-sm mt-0.5">Crie materiais didáticos em segundos.</p>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-5 items-start">
        {/* Input panel */}
        <Card className="lg:sticky lg:top-20">
          <PlannerInputForm
            classes={classes}
            loading={isLoading}
            onGenerate={handleGenerate}
          />
        </Card>

        {/* Output panel */}
        <div>
          {status === 'idle' && (
            <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
              <p className="text-4xl mb-3">🤖</p>
              <p className="font-medium text-slate-600">O material gerado aparecerá aqui</p>
              <p className="text-sm mt-1">Preencha o formulário e clique em "Gerar com IA"</p>
            </div>
          )}

          {(status === 'generating' || status === 'uploading') && (
            <Card>
              <div className="flex items-center gap-3 mb-4 text-slate-600 text-sm">
                <Spinner size="sm" />
                <span>
                  {status === 'uploading' ? 'Processando arquivo...' : 'Gerando com IA...'}
                </span>
              </div>
              {content && <StreamingText content={content} />}
            </Card>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <div>
                <p className="font-medium">Erro ao gerar conteúdo</p>
                <p className="text-red-500 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {status === 'done' && (
            <Card padding={false}>
              <div className="flex items-center gap-2 px-4 pt-3 pb-1 text-xs text-accent-600 font-medium">
                <CheckCircle2 size={14} />
                <span>Salvo automaticamente no Acervo</span>
              </div>

              {lastType === 'slides' ? (
                <div className="p-4">
                  {slides.length > 0 ? (
                    <SlidesPreview slides={slides} topic={lastTopic} />
                  ) : (
                    <div className="prose max-w-none">
                      <MarkdownRenderer content={content} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4">
                  <MarkdownRenderer content={content} />
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
