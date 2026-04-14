import { type Request, type Response, type NextFunction } from 'express'
import admin from 'firebase-admin'

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({ credential: admin.credential.applicationDefault() })
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // For development without service account — skip auth or use project ID
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      })
    }
  } catch (err) {
    console.warn('Firebase Admin not fully initialized:', err)
  }
}

export interface AuthRequest extends Request {
  uid?: string
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.headers.authorization?.split('Bearer ')[1]

  if (!token) {
    // In development, allow unauthenticated requests
    if (process.env.NODE_ENV !== 'production') {
      req.uid = 'dev-user'
      next()
      return
    }
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token)
    req.uid = decoded.uid
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
