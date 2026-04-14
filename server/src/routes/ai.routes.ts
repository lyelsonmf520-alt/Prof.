import { Router, type Request, type Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { streamGenerateText, generateJSON } from '../services/gemini.service'

export const aiRoutes = Router()

aiRoutes.post('/generate', authMiddleware, async (req: Request, res: Response) => {
  const { prompt, type } = req.body as { prompt: string; type: string }

  if (!prompt) {
    res.status(400).json({ error: 'prompt is required' })
    return
  }

  if (!process.env.GEMINI_API_KEY) {
    res.status(503).json({ error: 'GEMINI_API_KEY not configured' })
    return
  }

  // For slides, use JSON mode and stream the result
  if (type === 'slides') {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    try {
      const slidesJson = await generateJSON(prompt)
      const jsonStr = JSON.stringify(slidesJson)
      res.write(`data: ${jsonStr}\n\n`)
      res.write('data: [DONE]\n\n')
      res.end()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error generating slides'
      res.write(`data: Erro: ${msg}\n\n`)
      res.write('data: [DONE]\n\n')
      res.end()
    }
    return
  }

  // Stream text generation
  await streamGenerateText(prompt, res)
})
