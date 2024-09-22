export interface User {
  _id: string
  id: string
  username: string
  email: string
  password: string
  role: string
  createdAt: Date
  updatedAt: Date
  code?: string // Optional property
}

export interface Classroom {
  _id: string
  name: string
  teacherId: string
  curriculumId: string
  curriculumName: string
  lastTopic: string
  createdAt: Date
  updatedAt: Date
  students: string[] // Array of ObjectId references, use string for simplicity
}

interface Week {
  _id: string
  weekNumber: number
  topic: string
  assignment: string
  project: string
}

export interface Curricula {
  _id: string
  name: string
  description: string
  length: number
  weeks: Week[]
  createdAt: Date
  updatedAt: Date
}

export interface Assignment {
  _id: string
  classroomId: string
  studentId: string
  weekNumber: number
  code: string // Changed to lowercase 'string'
  feedback: string
  score: number
}
