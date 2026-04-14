import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'prof-raposo-dev-secret-change-in-production'

export interface AuthRequest extends Request {
  uid?: string
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    res.status(401).json({ error: 'Token de autenticação não fornecido' })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { uid: string }
    req.uid = decoded.uid
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}
