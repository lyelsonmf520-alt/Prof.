import { Router, type Request, type Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { generatePPTX } from '../services/slides.service'
import { generateLessonPlanPDF, parseContentToSections } from '../services/pdf-generator.service'

export const slidesRoutes = Router()

// PPTX generation (PowerPoint)
slidesRoutes.post('/generate', authMiddleware, async (req: Request, res: Response) => {
  const { slides, topic } = req.body

  if (!slides || !Array.isArray(slides)) {
    res.status(400).json({ error: 'slides array is required' })
    return
  }

  try {
    const buffer = await generatePPTX(slides, topic || 'Apresentação')
    const filename = `${(topic || 'slides').replace(/[^a-z0-9]/gi, '_')}_slides.pptx`

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(buffer)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PPTX generation failed'
    res.status(500).json({ error: message })
  }
})

// PDF generation (professional lesson plan / activity sheet)
slidesRoutes.post('/pdf', authMiddleware, async (req: Request, res: Response) => {
  const { content, title, topic, teacher, subject, school, classInfo } = req.body as {
    content?: string
    title?: string
    topic?: string
    teacher?: string
    subject?: string
    school?: string
    classInfo?: string
  }

  if (!content || !title) {
    res.status(400).json({ error: 'content and title are required' })
    return
  }

  try {
    const today = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

    const sections = parseContentToSections(content, title)
    const buffer = await generateLessonPlanPDF({
      title,
      topic,
      teacher,
      subject,
      school,
      classInfo,
      date: today,
      sections,
    })

    const filename = `${(title || 'plano').replace(/[^a-z0-9]/gi, '_')}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(buffer)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PDF generation failed'
    res.status(500).json({ error: message })
  }
})
