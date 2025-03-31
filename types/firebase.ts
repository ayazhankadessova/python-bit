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
  updatedAt: number
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

export interface ClassroomTC {
  id: string
  name: string 
  teacherId: string  
  classCode: string
  curriculumId: string 
  students: string[] 
  lastTaughtWeek: number 
  createdAt: number 
  updatedAt: number 
  school: string 
}

export interface Week {
  weekNumber: number
  topic: string
  assignmentIds: string[] // Array of problem IDs
}

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
