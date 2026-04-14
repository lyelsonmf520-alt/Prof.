import { Router, type Request, type Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { generatePPTX } from '../services/slides.service'

export const slidesRoutes = Router()

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
