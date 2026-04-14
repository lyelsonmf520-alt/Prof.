import { Router, type Response } from 'express'
import { authMiddleware, type AuthRequest } from '../middleware/auth.middleware'
import {
  getClasses, createClass, updateClass, deleteClass,
  getSchedule, upsertScheduleSlot, deleteScheduleSlot,
  getEvents, createEvent, deleteEvent,
  getMaterials, createMaterial, deleteMaterial,
  getNotes, createNote, deleteNote,
  findUserById, updateUserProfile,
} from '../services/database.service'

export const dataRoutes = Router()

// All data routes require auth
dataRoutes.use(authMiddleware)

// ─── Profile ──────────────────────────────────────────────────────────────────

dataRoutes.get('/profile', (req: AuthRequest, res: Response) => {
  const user = findUserById(req.uid!)
  if (!user) { res.status(404).json({ error: 'Not found' }); return }
  res.json({
    uid: user.id,
    name: user.name,
    subject: user.subject,
    school: user.school,
    avatarUrl: user.avatar_url,
  })
})

dataRoutes.patch('/profile', (req: AuthRequest, res: Response) => {
  const { name, subject, school } = req.body
  updateUserProfile(req.uid!, { name, subject, school })
  const user = findUserById(req.uid!)!
  res.json({ uid: user.id, name: user.name, subject: user.subject, school: user.school, avatarUrl: user.avatar_url })
})

// ─── Classes ──────────────────────────────────────────────────────────────────

dataRoutes.get('/classes', (req: AuthRequest, res: Response) => {
  const rows = getClasses(req.uid!)
  res.json(rows.map((r) => ({
    id: r.id,
    name: r.name,
    level: r.level,
    studentProfile: r.student_profile,
    color: r.color,
    subjectOverride: r.subject_override,
  })))
})

dataRoutes.post('/classes', (req: AuthRequest, res: Response) => {
  const { name, level, studentProfile, color, subjectOverride } = req.body
  if (!name) { res.status(400).json({ error: 'name is required' }); return }
  const id = createClass(req.uid!, { name, level: level || '', studentProfile: studentProfile || '', color: color || '#4F46E5', subjectOverride })
  res.status(201).json({ id })
})

dataRoutes.patch('/classes/:id', (req: AuthRequest, res: Response) => {
  updateClass(req.params.id, req.uid!, req.body)
  res.json({ ok: true })
})

dataRoutes.delete('/classes/:id', (req: AuthRequest, res: Response) => {
  deleteClass(req.params.id, req.uid!)
  res.json({ ok: true })
})

// ─── Schedule ─────────────────────────────────────────────────────────────────

dataRoutes.get('/schedule', (req: AuthRequest, res: Response) => {
  const rows = getSchedule(req.uid!)
  res.json(rows.map((r) => ({
    id: r.id,
    dayOfWeek: r.day_of_week,
    period: r.period,
    classId: r.class_id,
  })))
})

dataRoutes.post('/schedule', (req: AuthRequest, res: Response) => {
  const { dayOfWeek, period, classId } = req.body
  if (dayOfWeek === undefined || period === undefined || !classId) {
    res.status(400).json({ error: 'dayOfWeek, period, classId required' }); return
  }
  const id = upsertScheduleSlot(req.uid!, { dayOfWeek, period, classId })
  res.status(201).json({ id })
})

dataRoutes.delete('/schedule/:id', (req: AuthRequest, res: Response) => {
  deleteScheduleSlot(req.params.id, req.uid!)
  res.json({ ok: true })
})

// ─── Events ───────────────────────────────────────────────────────────────────

dataRoutes.get('/events', (req: AuthRequest, res: Response) => {
  const rows = getEvents(req.uid!)
  res.json(rows.map((r) => ({
    id: r.id,
    title: r.title,
    date: r.date,
    type: r.type,
    classId: r.class_id,
  })))
})

dataRoutes.post('/events', (req: AuthRequest, res: Response) => {
  const { title, date, type, classId } = req.body
  if (!title || !date) { res.status(400).json({ error: 'title and date required' }); return }
  const id = createEvent(req.uid!, { title, date, type: type || 'custom', classId })
  res.status(201).json({ id })
})

dataRoutes.delete('/events/:id', (req: AuthRequest, res: Response) => {
  deleteEvent(req.params.id, req.uid!)
  res.json({ ok: true })
})

// ─── Materials ────────────────────────────────────────────────────────────────

dataRoutes.get('/materials', (req: AuthRequest, res: Response) => {
  const rows = getMaterials(req.uid!)
  res.json(rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    topic: r.topic,
    classId: r.class_id,
    className: r.class_name,
    content: r.content,
    slidesJson: r.slides_json,
    createdAt: r.created_at,
    tags: JSON.parse(r.tags || '[]'),
  })))
})

dataRoutes.post('/materials', (req: AuthRequest, res: Response) => {
  const { type, title, topic, classId, className, content, slidesJson, tags } = req.body
  if (!type || !title) { res.status(400).json({ error: 'type and title required' }); return }
  const id = createMaterial(req.uid!, { type, title, topic: topic || '', classId, className, content: content || '', slidesJson, tags })
  res.status(201).json({ id })
})

dataRoutes.delete('/materials/:id', (req: AuthRequest, res: Response) => {
  deleteMaterial(req.params.id, req.uid!)
  res.json({ ok: true })
})

// ─── Notes ────────────────────────────────────────────────────────────────────

dataRoutes.get('/notes', (req: AuthRequest, res: Response) => {
  const rows = getNotes(req.uid!)
  res.json(rows.map((r) => ({
    id: r.id,
    body: r.body,
    pinned: r.pinned === 1,
    createdAt: r.created_at,
  })))
})

dataRoutes.post('/notes', (req: AuthRequest, res: Response) => {
  const { body } = req.body
  if (!body) { res.status(400).json({ error: 'body required' }); return }
  const id = createNote(req.uid!, body)
  res.status(201).json({ id })
})

dataRoutes.delete('/notes/:id', (req: AuthRequest, res: Response) => {
  deleteNote(req.params.id, req.uid!)
  res.json({ ok: true })
})
