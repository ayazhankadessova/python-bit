// types/firebase.ts

// Firebase Types

// Firebase Types - Some fields might be missing in the raw data
export interface FirebaseUserData {
  classrooms?: string[]
  createdAt: number
  dislikedProblems?: string[]
  displayName: string
  email: string
  likedProblems?: string[]
  role: 'student' | 'teacher'
  school: string
  solvedProblems?: string[]
  starredProblems?: string[]
  uid: string
  updatedAt: number
}

// Application Types - All fields are required in processed data
export interface User {
  uid: string
  email: string
  displayName: string
  role: 'student' | 'teacher'
  school: string
  solvedProblems: string[]
  classrooms: string[]
  likedProblems: string[]
  dislikedProblems: string[]
  starredProblems: string[]
  createdAt: number
}

// Helper function to validate required user data
export function isValidUserData(data: any): data is FirebaseUserData {
  return (
    data &&
    typeof data.email === 'string' &&
    typeof data.displayName === 'string' &&
    (data.role === 'student' || data.role === 'teacher') &&
    typeof data.school === 'string'
  )
}

interface WeeklyProgress {
  weekNumber: number
  classroomId: string
  studentProgress: {
    [studentId: string]: {
      problemProgress: {
        [problemId: string]: {
          completed: boolean
          startedAt?: number
          completedAt?: number
          attempts: number
        }
      }
    }
  }
  startedAt: number
  endedAt?: number
}

export interface Classroom {
  id: string
  name: string
  teacherId: string
  curriculumId: string
  curriculumName: string
  students: string[]
  classCode: string
  lastTaughtWeek: number
  createdAt: number
  updatedAt: number
  weeklyProgressIds: {
    [weekNumber: number]: string // Maps week numbers to their progress docs
  }
}

interface StudentClassroom {
  classroomId: string
  joinedAt: number
}

// Classes in files

export interface ClassroomTC {
  id: string
  name: string
  teacherId: string
  curriculumId: string
  students: string[]
  curriculumName: string
  classCode: string
  lastTaughtWeek: number
  activeSession?: boolean
  curriculum?: CurriculumInputs
}

export interface Week {
  weekNumber: number
  topic: string
  assignmentIds: string[] // Array of problem IDs
}

interface CurriculumInputs {
  id: string
  name: string
  description: string
  weeks: Week[]
}
