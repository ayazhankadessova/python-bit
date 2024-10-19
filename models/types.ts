export interface User {
  _id: string
  id: string
  username: string
  email: string
  password: string
  role: string
  createdAt: Date
  updatedAt: Date
  code?: string
  completedTasks?: number[] // Changed back to number[]
}

export interface Classroom {
  _id: string
  name: string
  teacherId: string
  curriculumId: string
  curriculumName: string
  lastTaughtWeek: number
  createdAt: Date
  updatedAt: Date
  students?: string[]
}

interface Week {
  weekNumber: number
  topic: string
  assignmentId: string // This will be an ObjectId, but we'll use string for simplicity
}

export interface Curriculum {
  _id: string
  name: string
  description: string
  weeks: Week[]
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: number
  title: string
  description: string
  testCases: Array<{
    input: string
    expectedOutput: string
  }>
}

export interface Assignment {
  _id: string
  classroomId: string
  studentId: string
  weekNumber: number
  code: string
  feedback: string
  score: number
  tasks: Task[]
}
