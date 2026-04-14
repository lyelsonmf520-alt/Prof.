import Database from 'better-sqlite3'
import { join } from 'path'
import { mkdirSync } from 'fs'
import { randomUUID } from 'crypto'

const DB_PATH = process.env.DB_PATH || join(process.cwd(), 'data', 'prof-raposo.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db

  // Ensure data directory exists
  const dir = join(DB_PATH, '..')
  mkdirSync(dir, { recursive: true })

  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  initSchema(_db)
  console.log(`📦 SQLite database ready at ${DB_PATH}`)
  return _db
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      email       TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name        TEXT NOT NULL DEFAULT '',
      subject     TEXT NOT NULL DEFAULT '',
      school      TEXT NOT NULL DEFAULT '',
      avatar_url  TEXT,
      created_at  INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classes (
      id               TEXT PRIMARY KEY,
      user_id          TEXT NOT NULL,
      name             TEXT NOT NULL,
      level            TEXT NOT NULL DEFAULT '',
      student_profile  TEXT NOT NULL DEFAULT '',
      color            TEXT NOT NULL DEFAULT '#4F46E5',
      subject_override TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS schedule (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      day_of_week INTEGER NOT NULL,
      period      INTEGER NOT NULL,
      class_id    TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS events (
      id       TEXT PRIMARY KEY,
      user_id  TEXT NOT NULL,
      title    TEXT NOT NULL,
      date     TEXT NOT NULL,
      type     TEXT NOT NULL DEFAULT 'custom',
      class_id TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS materials (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      type        TEXT NOT NULL,
      title       TEXT NOT NULL,
      topic       TEXT NOT NULL DEFAULT '',
      class_id    TEXT,
      class_name  TEXT,
      content     TEXT NOT NULL DEFAULT '',
      slides_json TEXT,
      created_at  INTEGER NOT NULL,
      tags        TEXT NOT NULL DEFAULT '[]',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notes (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      body       TEXT NOT NULL,
      pinned     INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)
}

export function newId(): string {
  return randomUUID()
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function createUser(data: {
  email: string
  passwordHash: string
  name: string
}): { id: string } {
  const db = getDb()
  const id = newId()
  db.prepare(
    `INSERT INTO users (id, email, password_hash, name, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, data.email.toLowerCase(), data.passwordHash, data.name, Date.now())
  return { id }
}

export function findUserByEmail(email: string) {
  const db = getDb()
  return db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(email.toLowerCase()) as
    | {
        id: string
        email: string
        password_hash: string
        name: string
        subject: string
        school: string
        avatar_url: string | null
        created_at: number
      }
    | undefined
}

export function findUserById(id: string) {
  const db = getDb()
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as
    | {
        id: string
        email: string
        name: string
        subject: string
        school: string
        avatar_url: string | null
        created_at: number
      }
    | undefined
}

export function updateUserProfile(
  id: string,
  data: { name?: string; subject?: string; school?: string; avatar_url?: string }
): void {
  const db = getDb()
  const fields: string[] = []
  const values: unknown[] = []

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name) }
  if (data.subject !== undefined) { fields.push('subject = ?'); values.push(data.subject) }
  if (data.school !== undefined) { fields.push('school = ?'); values.push(data.school) }
  if (data.avatar_url !== undefined) { fields.push('avatar_url = ?'); values.push(data.avatar_url) }

  if (fields.length === 0) return
  values.push(id)
  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values)
}

// ─── Classes ──────────────────────────────────────────────────────────────────

export function getClasses(userId: string) {
  const db = getDb()
  return db
    .prepare('SELECT * FROM classes WHERE user_id = ?')
    .all(userId) as Array<{
    id: string
    user_id: string
    name: string
    level: string
    student_profile: string
    color: string
    subject_override: string | null
  }>
}

export function createClass(userId: string, data: {
  name: string
  level: string
  studentProfile: string
  color: string
  subjectOverride?: string | null
}): string {
  const db = getDb()
  const id = newId()
  db.prepare(
    `INSERT INTO classes (id, user_id, name, level, student_profile, color, subject_override)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, userId, data.name, data.level, data.studentProfile, data.color, data.subjectOverride ?? null)
  return id
}

export function updateClass(id: string, userId: string, data: Partial<{
  name: string
  level: string
  studentProfile: string
  color: string
  subjectOverride: string | null
}>): void {
  const db = getDb()
  const map: Record<string, string> = {
    name: 'name', level: 'level', studentProfile: 'student_profile',
    color: 'color', subjectOverride: 'subject_override',
  }
  const fields: string[] = []
  const values: unknown[] = []
  for (const [k, col] of Object.entries(map)) {
    if ((data as Record<string, unknown>)[k] !== undefined) {
      fields.push(`${col} = ?`)
      values.push((data as Record<string, unknown>)[k])
    }
  }
  if (fields.length === 0) return
  values.push(id, userId)
  db.prepare(`UPDATE classes SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`).run(...values)
}

export function deleteClass(id: string, userId: string): void {
  const db = getDb()
  db.prepare('DELETE FROM classes WHERE id = ? AND user_id = ?').run(id, userId)
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export function getSchedule(userId: string) {
  const db = getDb()
  return db
    .prepare('SELECT * FROM schedule WHERE user_id = ?')
    .all(userId) as Array<{
    id: string
    user_id: string
    day_of_week: number
    period: number
    class_id: string
  }>
}

export function upsertScheduleSlot(userId: string, data: {
  dayOfWeek: number
  period: number
  classId: string
}): string {
  const db = getDb()
  // Remove existing slot for this day+period
  db.prepare(
    'DELETE FROM schedule WHERE user_id = ? AND day_of_week = ? AND period = ?'
  ).run(userId, data.dayOfWeek, data.period)
  const id = newId()
  db.prepare(
    'INSERT INTO schedule (id, user_id, day_of_week, period, class_id) VALUES (?, ?, ?, ?, ?)'
  ).run(id, userId, data.dayOfWeek, data.period, data.classId)
  return id
}

export function deleteScheduleSlot(id: string, userId: string): void {
  const db = getDb()
  db.prepare('DELETE FROM schedule WHERE id = ? AND user_id = ?').run(id, userId)
}

// ─── Events ───────────────────────────────────────────────────────────────────

export function getEvents(userId: string) {
  const db = getDb()
  return db
    .prepare('SELECT * FROM events WHERE user_id = ?')
    .all(userId) as Array<{
    id: string
    user_id: string
    title: string
    date: string
    type: string
    class_id: string | null
  }>
}

export function createEvent(userId: string, data: {
  title: string
  date: string
  type: string
  classId?: string | null
}): string {
  const db = getDb()
  const id = newId()
  db.prepare(
    'INSERT INTO events (id, user_id, title, date, type, class_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, userId, data.title, data.date, data.type, data.classId ?? null)
  return id
}

export function deleteEvent(id: string, userId: string): void {
  const db = getDb()
  db.prepare('DELETE FROM events WHERE id = ? AND user_id = ?').run(id, userId)
}

// ─── Materials ────────────────────────────────────────────────────────────────

export function getMaterials(userId: string) {
  const db = getDb()
  return db
    .prepare('SELECT * FROM materials WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as Array<{
    id: string
    user_id: string
    type: string
    title: string
    topic: string
    class_id: string | null
    class_name: string | null
    content: string
    slides_json: string | null
    created_at: number
    tags: string
  }>
}

export function createMaterial(userId: string, data: {
  type: string
  title: string
  topic: string
  classId?: string | null
  className?: string | null
  content: string
  slidesJson?: string | null
  tags?: string[]
}): string {
  const db = getDb()
  const id = newId()
  db.prepare(
    `INSERT INTO materials
     (id, user_id, type, title, topic, class_id, class_name, content, slides_json, created_at, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, userId, data.type, data.title, data.topic,
    data.classId ?? null, data.className ?? null,
    data.content, data.slidesJson ?? null,
    Date.now(), JSON.stringify(data.tags ?? [])
  )
  return id
}

export function deleteMaterial(id: string, userId: string): void {
  const db = getDb()
  db.prepare('DELETE FROM materials WHERE id = ? AND user_id = ?').run(id, userId)
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export function getNotes(userId: string) {
  const db = getDb()
  return db
    .prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY pinned DESC, created_at DESC')
    .all(userId) as Array<{
    id: string
    user_id: string
    body: string
    pinned: number
    created_at: number
  }>
}

export function createNote(userId: string, body: string): string {
  const db = getDb()
  const id = newId()
  db.prepare(
    'INSERT INTO notes (id, user_id, body, pinned, created_at) VALUES (?, ?, ?, 0, ?)'
  ).run(id, userId, body, Date.now())
  return id
}

export function deleteNote(id: string, userId: string): void {
  const db = getDb()
  db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(id, userId)
}
