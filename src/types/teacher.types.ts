export interface TeacherProfile {
  uid: string
  name: string
  subject: string
  school: string
  avatarUrl: string | null
  createdAt: Date
}

export interface TeacherClass {
  id: string
  name: string
  level: string
  studentProfile: string
  color: string
  subjectOverride: string | null
}

export interface ScheduleSlot {
  id: string
  dayOfWeek: number // 0=Sunday, 1=Monday...
  period: number    // 1-6
  classId: string
}
