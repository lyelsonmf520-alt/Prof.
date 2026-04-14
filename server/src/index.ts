import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { aiRoutes } from './routes/ai.routes'
import { slidesRoutes } from './routes/slides.routes'
import { uploadRoutes } from './routes/upload.routes'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: ['http://localhost:5173', process.env.APP_URL || ''].filter(Boolean) }))
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// Routes
app.use('/api/ai', aiRoutes)
app.use('/api/slides', slidesRoutes)
app.use('/api/upload', uploadRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Prof. Raposo server running on http://localhost:${PORT}`)
})
