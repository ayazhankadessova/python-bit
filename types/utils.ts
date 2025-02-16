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

export type Problem = {
  id: string
  title: string
  problemStatement: string
  examples: Example[]
  constraints: string
  order: number
  starterCode: string
  handlerFunction: (fn: any) => boolean
  starterFunctionName?: string
  testCases?: TestCase[]
}

interface TestCase {
  input: any
  expected: any
}

export type DBProblem = {
  id: string
  title: string
  category: string
  difficulty: string
  likes: number
  dislikes: number
  order: number
  videoId?: string
  link?: string
}
