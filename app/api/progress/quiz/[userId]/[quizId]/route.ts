export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'

export async function GET(
  request: Request
  // { params }: { params: Promise<{ userId: string; quizId: string }> }
) {
  try {
    // Parse the query parameters from the request URL
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userID')
    const quizId = searchParams.get('quizID')

    if (!userId || !quizId) {
      return NextResponse.json(
        { error: 'Missing userId or quizId' },
        { status: 400 }
      )
    }

    const quizRef = doc(fireStore, 'users', userId, 'quizzes', quizId)
    const quizDoc = await getDoc(quizRef)

    if (!quizDoc.exists()) {
      return NextResponse.json({
        passed: false,
        lastTaken: null,
        attempts: 0,
        successfulAttempts: 0,
      })
    }

    const data = quizDoc.data()

    return NextResponse.json({
      passed: data.passed || false,
      lastTaken: data.lastTaken || null,
      attempts: data.attempts || 0,
      successfulAttempts: data.successfulAttempts || 0,
      highestScore: data.highestScore || 0,
      score: data.score || 0,
      correctAnswers: data.correctAnswers || 0,
      totalQuestions: data.totalQuestions || 0,
      selectedAnswers: data.selectedAnswers || [],
    })
  } catch (error) {
    console.error('Error getting quiz progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz progress' },
      { status: 500 }
    )
  }
}
