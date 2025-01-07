export interface ParticipantsData {
  teacher: string | null
  students: string[]
}

export interface StudentCodeData {
  username: string
  code: string
}

export interface TeacherCodeData {
  code: string
}

export interface CodeUpdateData {
  code: string
  username?: string
}

export interface SendCodeToStudentData {
  studentUsername: string
  code: string
}

export type WebSocketMessageType =
  | 'update-participants'
  | 'student-code'
  | 'teacher-code'
  | 'code-update'
  | 'student-code-updated'
  | 'send-code-to-student'
  | 'send-code-to-all'
  | 'get-student-code'
  | 'request-code'

export interface WebSocketMessage {
  type: WebSocketMessageType
  data:
    | ParticipantsData
    | StudentCodeData
    | TeacherCodeData
    | CodeUpdateData
    | SendCodeToStudentData
}
