import { User } from '@/types/firebase'

export async function recordQuizAttempt(
  user: User | null,
  quizId: string,
  quizTitle: string,
  tutorialId: string,
  score: number,
  correctAnswers: number,
  totalQuestions: number,
  selectedAnswers: number[]
) {
  if (!user) return false

  try {
    const response = await fetch('/api/progress/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.uid,
        quizId,
        quizTitle,
        tutorialId,
        score,
        correctAnswers,
        totalQuestions,
        selectedAnswers,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to record quiz attempt')
    }

    return true
  } catch (error) {
    console.error('Error recording quiz attempt:', error)
    return false
  }
}
