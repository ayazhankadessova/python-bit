import { FieldValue } from 'firebase/firestore'
export interface StudentCode {
  code: string
  lastUpdated: number
}

export interface CodeSubmission {
  code: string
  submittedAt: number
  task: string
}

export interface MonitoringState {
  // Whether the browser tab is currently active/visible
  isTabActive: boolean

  // Whether the browser is in fullscreen mode
  isFullscreen: boolean

  // Timestamp of the last time the student interacted with the tab
  lastActiveTime: number

  // The total width of the user's screen
  screenWidth: number

  // The current width of the browser window
  browserWidth: number

  updatedAt: number
}


export interface SessionStudent {
  code: string
  lastUpdated: number
  submissions: CodeSubmission[]
  monitoring?: MonitoringState
  displayName?: string
}

export interface ActiveStudent {
  uid: string
  displayName: string
}

export interface LiveSession {
  id: string
  startedAt: number
  endedAt: number | null
  weekNumber: number
  activeTask: string
  students: Record<string, SessionStudent>
  activeStudents: ActiveStudent[] 
}

export interface SessionWithDuration extends LiveSession {
  duration?: string
}

export interface ExecutionResult {
  success: boolean
  output?: string
  error?: string
}

export interface Week {
  weekNumber: number
  title: string
  assignmentIds: string[]
}

export interface Curriculum {
  id?: string
  name: string
  description: string
  weeks: Week[]
}

export interface Assignment {
  id: string
  title: string
  problemStatement: string
  starterCode: string
  starterFunctionName: string
  examples: Example[]
}

export interface Example {
  id: string
  inputText: string
  outputText: string
  explanation?: string
}

export interface AssignmentProgressProps {
  assignmentId: string | null
  activeStudents: ActiveStudent[]
}

export interface StudentProgress {
  completed: boolean
  totalAttempts: number | FieldValue
  successfulAttempts: number | FieldValue
  lastAttempt: number | null
}