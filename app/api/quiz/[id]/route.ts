import { NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { Quiz } from '@/types/quiz/quiz'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id

    // Reference to the specific quiz document in Firestore
    const quizDocRef = doc(fireStore, 'quizzes', quizId)

    // Fetch the document
    const quizDocSnap = await getDoc(quizDocRef)

    // Check if the document exists
    if (!quizDocSnap.exists()) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Get the document data and include the ID
    const quiz: Quiz = {
      ...quizDocSnap.data(),
      id: quizDocSnap.id,
    } as Quiz

    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Error fetching quiz from Firestore:', error)
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
  }
}
