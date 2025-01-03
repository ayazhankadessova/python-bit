export interface CodeEditorProps {
  initialCode?: string
  expectedOutput?: string
  project_id: string
  isProject?: boolean
}

export interface ExerciseCodeEditorProps {
  initialCode?: string
  expectedOutput?: string
  exercise_number?: number
  tutorial_id?: string
  isProject?: boolean
}
