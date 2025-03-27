import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { Quiz } from '@/types/quiz/quiz'

export async function GET() {
  try {
    // Path to the /public/quiz folder
    const quizFolderPath = path.join(process.cwd(), 'public', 'quiz')
    const quizFiles = fs.readdirSync(quizFolderPath)

    const quizzes: Quiz[] = quizFiles.map((file) => {
      const filePath = path.join(quizFolderPath, file)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(fileContents) as Quiz
    })

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    )
  }
}
