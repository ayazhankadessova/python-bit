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

export interface Student {
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
  code: string
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

// interface WeeklyProgress {
//   weekNumber: number
//   classroomId: string
//   studentProgress: {
//     [studentId: string]: {
//       problemProgress: {
//         [problemId: string]: {
//           completed: boolean
//           startedAt?: number
//           completedAt?: number
//           attempts: number
//         }
//       }
//     }
//   }
//   startedAt: number
//   endedAt?: number
// }

// Classes in files

export interface ClassroomTC {
  id: string
  name: string // yes
  teacherId: string  // yes
  curriculumId: string // //yes
  students: string[] // yes
  lastTaughtWeek: number // yes
  createdAt: number //yes
  updatedAt: number //yes
  school: string // yes
}

export interface Week {
  weekNumber: number
  topic: string
  assignmentIds: string[] // Array of problem IDs
}

// interface CurriculumInputs {
//   id: string
//   name: string
//   description: string
//   weeks: Week[]
// }

export interface TutorialProgress {
  exerciseId: string
  completed: boolean
  timestamp: number
}

export interface UserTutorialProgress {
  [tutorialId: string]: {
    [exerciseNumber: number]: TutorialProgress
  }
}