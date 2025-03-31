export interface Project {
  id: string
  title: string
  description: string
  date: number
  theme?: string
  difficulty: string
  estimatedTime: string
  tags: string[]
  image?: string
  published: boolean
  starterCode?: string
  testCode?: string
  solution?: string
}

export type ProjectCollection = {
  [key: string]: Project
}

export type Example = {
  id: number
  inputText: string
  outputText: string
  explanation?: string
  img?: string
}

export type ContactInfo = {
  email: string
  telegram: string
  description: string
}