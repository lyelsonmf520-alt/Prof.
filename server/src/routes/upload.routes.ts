import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import { authMiddleware } from '../middleware/auth.middleware'
import { extractTextFromPDF } from '../services/pdf.service'
import { describeImage } from '../services/claude.service'

export const uploadRoutes = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
})

uploadRoutes.post('/pdf', authMiddleware, upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' })
    return
  }

  try {
    const text = await extractTextFromPDF(req.file.buffer)
    res.json({ text: text.substring(0, 8000) }) // Limit context size
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PDF processing failed'
    res.status(500).json({ error: message })
  }
})

uploadRoutes.post('/image', authMiddleware, upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' })
    return
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' })
    return
  }

  try {
    const base64 = req.file.buffer.toString('base64')
    const mimeType = req.file.mimetype || 'image/jpeg'
    const text = await describeImage(base64, mimeType)
    res.json({ text })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Image processing failed'
    res.status(500).json({ error: message })
  }
})
