// app/api/quiz/[id]/route.ts
import { NextResponse } from 'next/server'
import { Quiz } from '@/types/quiz/quiz'
import path from 'path'
import fs from 'fs'

// In a real app, this would come from a database
const getQuizData = (id: string): Quiz | null => {
  try {
    // This path should be adjusted based on your project structure
    const filePath = path.join(process.cwd(), 'config', 'quiz', `${id}.json`)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContents)
  } catch (error) {
    console.error(`Error loading quiz ${id}:`, error)
    return null
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const quizId = params.id
  const quiz = getQuizData(quizId)

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  return NextResponse.json(quiz)
}
