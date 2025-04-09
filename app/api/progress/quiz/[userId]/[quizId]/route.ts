import { NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'

export async function GET(
  request: Request,
  props: { params: Promise<{ userId: string; quizId: string }> }
) {
  const params = await props.params;
  try {
    const { userId, quizId } = params

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
