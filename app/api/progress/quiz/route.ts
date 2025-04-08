import { NextResponse } from 'next/server'
import {
  doc,
  collection,
  //   addDoc,
  getDoc,
  setDoc,
  increment,
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'

export async function POST(request: Request) {
  try {
    const {
      userId,
      quizId,
      quizTitle,
      tutorialId,
      score,
      correctAnswers,
      totalQuestions,
      selectedAnswers,
    } = await request.json()

    if (!userId || !quizId) {
      return NextResponse.json(
        { error: 'Missing userId or quizId' },
        { status: 400 }
      )
    }

    const isPassed = score >= 70 // 70% passing threshold
    const timestamp = Date.now()

    // Reference to main quiz document
    const quizRef = doc(fireStore, 'users', userId, 'quizzes', quizId)

    // Create attempt document
    const attemptRef = doc(
      collection(fireStore, 'users', userId, 'quizzes', quizId, 'attempts')
    )
    await setDoc(attemptRef, {
      timestamp: timestamp,
      score: score,
      correctAnswers: correctAnswers,
      totalQuestions: totalQuestions,
      passed: isPassed,
      selectedAnswers: selectedAnswers,
    })

    // Check if quiz document exists
    const quizDoc = await getDoc(quizRef)

    // Update or create quiz progress document
    if (quizDoc.exists()) {
      const existingData = quizDoc.data()
      const currentHighestScore = existingData.highestScore || 0
      await setDoc(
        quizRef,
        {
          lastTaken: timestamp,
          attempts: increment(1),
          passed: quizDoc.data().passed || isPassed, // Only set to true if not already passed
          highestScore: Math.max(currentHighestScore, score),
          successfulAttempts: isPassed ? increment(1) : 0,
          score: score,
          correctAnswers: correctAnswers,
          totalQuestions: totalQuestions,
          selectedAnswers: selectedAnswers,
        },
        { merge: true }
      )
    } else {
      await setDoc(quizRef, {
        quizTitle: quizTitle,
        tutorialId: tutorialId,
        lastTaken: timestamp,
        attempts: 1,
        passed: isPassed,
        successfulAttempts: isPassed ? 1 : 0,
        highestScore: score,
        score: score,
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        selectedAnswers: selectedAnswers,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error recording quiz attempt:', error)
    return NextResponse.json(
      { error: 'Failed to record quiz attempt' },
      { status: 500 }
    )
  }
}
