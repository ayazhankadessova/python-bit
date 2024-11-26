// types/firebase.ts
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

interface Classroom {
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
