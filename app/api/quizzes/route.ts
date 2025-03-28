import { NextResponse } from 'next/server'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { Quiz } from '@/types/quiz/quiz'

export async function GET(request: Request) {
  try {
    // Parse the query parameters from the request URL
    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get('quizId')

    if (quizId) {
      // If quizId is provided, fetch the specific quiz
      const quizDocRef = doc(fireStore, 'problems', quizId)
      const quizDocSnap = await getDoc(quizDocRef)

      if (!quizDocSnap.exists()) {
        return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
      }

      const quiz: Quiz = {
        ...quizDocSnap.data(),
        id: quizDocSnap.id,
      } as Quiz

      return NextResponse.json(quiz)
    } else {
      // If no quizId is provided, fetch all quizzes
      const quizzesCollection = collection(fireStore, 'problems')
      const querySnapshot = await getDocs(quizzesCollection)

      const quizzes: Quiz[] = querySnapshot.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            id: doc.id,
          } as Quiz)
      )

      return NextResponse.json(quizzes)
    }
  } catch (error) {
    console.error('Error fetching quizzes from Firestore:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    )
  }
}
