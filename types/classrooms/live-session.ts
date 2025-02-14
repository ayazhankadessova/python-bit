
export interface StudentCode {
  code: string
  lastUpdated: number
}

export interface CodeSubmission {
  code: string
  submittedAt: number
  task: string
}

export interface SessionStudent {
  code: string
  lastUpdated: number
  submissions: CodeSubmission[]
}

export interface LiveSession {
  id: string
  startedAt: number
  endedAt: number | null
  weekNumber: number
  activeTask: string
  students: Record<string, SessionStudent>
  activeStudents: string[]
}

export interface SessionWithDuration extends LiveSession {
  duration?: string
}

export interface Submission {
  classroomId: string
  sessionId: string
  studentId: string
  taskId: string
  code: string
  submittedAt: number
  weekNumber: number
  executionResult: string
  passed: boolean
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
