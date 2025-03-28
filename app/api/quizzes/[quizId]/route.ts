import { NextResponse } from 'next/server'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { Quiz } from '@/types/quiz/quiz'

export async function GET(
  request: Request,
  { params }: { params: { quizId: string } }
) {
  const quizId = params.quizId

  try {
    const quizzesCollection = collection(fireStore, 'quizzes')

    const querySnapshot = await getDocs(quizzesCollection)

    const quizDoc = querySnapshot.docs.find((doc) => doc.id === quizId)

    if (!quizDoc) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    const quizDocRef = doc(fireStore, 'quizzes', quizId)
    const quizDocSnap = await getDoc(quizDocRef)

    // Construct the quiz object
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
