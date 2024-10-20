// export interface User {
//   _id: string
//   id: string
//   username: string
//   email: string
//   password: string
//   role: string
//   createdAt: Date
//   updatedAt: Date
//   code?: string
//   completedTasks?: number[] // Changed back to number[]
// }

// interface StudentProgress {
//   userId: string
//   completedTasks: number[]
// }

// export interface Classroom {
//   _id: string
//   name: string
//   teacherId: string
//   curriculumId: string
//   curriculumName: string
//   lastTaughtWeek: number
//   createdAt: Date
//   updatedAt: Date
//   students?: string[]
//   progress: WeeklyProgress[]
//   weeks: Week[]
// }

// export interface WeeklyProgress {
//   _id: string
//   weekNumber: number
//   studentProgress?: StudentProgress[]
// }

// export interface Week {
//   weekNumber: number
//   topic: string
//   assignmentId: string // This will be an ObjectId, but we'll use string for simplicity
// }

// export interface Curriculum {
//   _id: string
//   name: string
//   description: string
//   weeks: Week[]
//   createdAt: Date
//   updatedAt: Date
// }

// export interface Task {
//   id: number
//   title: string
//   description: string
//   testCases: Array<{
//     input: string
//     expectedOutput: string
//   }>
// }

// export interface Assignment {
//   _id: string
//   classroomId: string
//   studentId: string
//   weekNumber: number
//   code: string
//   feedback: string
//   score: number
//   tasks: Task[]
// }

export interface User {
  _id: string
  id: string
  username: string
  email: string
  password: string
  role: string
  createdAt: Date
  updatedAt: Date
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
  completedBy: StudentCompletion[]
}

export interface StudentCompletion {
  username: string
  code: string
  completedAt: Date
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
  students: string[] // Array of student usernames
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
  testCases: Array<{
    input: string
    expectedOutput: string
  }>
}
