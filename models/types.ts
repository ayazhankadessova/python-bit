export interface User {
  _id: string
  email: string
  username: string
  role: 'teacher' | 'student'
  school: string
  updatedAt: Date
  code?: string | null
  classrooms?: string[]
  createdAt: Date
}

export interface Teacher extends User {
  role: 'teacher'
  // classrooms?: string[] // Array of classroom IDs
  subject?: string
}

export interface Student extends User {
  role: 'student'
  // classrooms?: string[] // Array of classroom IDs
  grade?: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  username: string
  role: 'teacher' | 'student'
  school?: string
  subject?: string // for teachers
  grade?: number // for students
}

export interface AuthResponse {
  user: User
  token: string
}

export interface WeeklyProgress {
  _id: string
  classroomId: string
  weekNumber: number
  assignmentId: string
  tasks: TaskProgress[]
}

export interface TaskProgress {
  taskId: number
  completedBy: string[]
}

export interface StudentCompletion {
  username: string
  code: string
  completedAt: Date
}

// models/types.ts
export interface Classroom {
  _id: string
  name: string
  teacherId: string
  curriculumId: string
  curriculumName: string
  students: string[]
  lastTaughtWeek: number
  classCode: string
  createdAt: Date
  updatedAt: Date
}

export interface Week {
  weekNumber: number
  topic: string
  assignmentId: string
}

export interface StudentProgress {
  username: string
  code?: string
  completedTasks: number[]
}

export interface Curriculum {
  _id: string
  name: string
  description: string
  weeks: Week[]
  createdAt: Date
  updatedAt: Date
}

export interface Assignment {
  _id: string
  tasks: Task[]
}

export interface Task {
  id: number
  title: string
  description: string
  starterCode: string
  testCases: Array<{
    input: string
    expectedOutput: string
  }>
}

export interface LessonProgressCardProps {
  classroomId: string
  weekNumber: number | null
  tasks: Task[]
  classroom: Classroom | null
}
