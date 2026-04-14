import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile,
} from '../services/database.service'
import { authMiddleware, type AuthRequest } from '../middleware/auth.middleware'

export const authRoutes = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'prof-raposo-dev-secret-change-in-production'
const SALT_ROUNDS = 10

function signToken(userId: string): string {
  return jwt.sign({ uid: userId }, JWT_SECRET, { expiresIn: '30d' })
}

function safeUser(user: { id: string; email: string; name: string; subject: string; school: string; avatar_url: string | null }) {
  return {
    uid: user.id,
    email: user.email,
    name: user.name,
    subject: user.subject,
    school: user.school,
    avatarUrl: user.avatar_url,
  }
}

// POST /api/auth/register
authRoutes.post('/register', async (req: Request, res: Response) => {
  const { email, password, name } = req.body as {
    email?: string
    password?: string
    name?: string
  }

  if (!email || !password || !name) {
    res.status(400).json({ error: 'email, password e name são obrigatórios' })
    return
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' })
    return
  }

  try {
    const existing = findUserByEmail(email)
    if (existing) {
      res.status(409).json({ error: 'E-mail já cadastrado' })
      return
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const { id } = createUser({ email, passwordHash, name })
    const token = signToken(id)
    const user = findUserById(id)!

    res.status(201).json({ token, user: safeUser(user) })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    res.status(500).json({ error: message })
  }
})

// POST /api/auth/login
authRoutes.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string }

  if (!email || !password) {
    res.status(400).json({ error: 'email e password são obrigatórios' })
    return
  }

  try {
    const user = findUserByEmail(email)
    if (!user) {
      res.status(401).json({ error: 'E-mail ou senha incorretos' })
      return
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      res.status(401).json({ error: 'E-mail ou senha incorretos' })
      return
    }

    const token = signToken(user.id)
    res.json({ token, user: safeUser(user) })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed'
    res.status(500).json({ error: message })
  }
})

// GET /api/auth/me
authRoutes.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = findUserById(req.uid!)
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json({ user: safeUser(user) })
})

// PATCH /api/auth/profile
authRoutes.patch('/profile', authMiddleware, (req: AuthRequest, res: Response) => {
  const { name, subject, school } = req.body as {
    name?: string
    subject?: string
    school?: string
  }

  updateUserProfile(req.uid!, { name, subject, school })
  const updated = findUserById(req.uid!)!
  res.json({ user: safeUser(updated) })
})
