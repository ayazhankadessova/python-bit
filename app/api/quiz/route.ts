import { NextResponse } from 'next/server'
import { collection, getDocs } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { Quiz } from '@/types/quiz/quiz'

export async function GET() {
  try {
    // Reference to the 'quizzes' collection in Firestore
    const quizzesCollection = collection(fireStore, 'quizzes')

    // Fetch all documents from the quizzes collection
    const querySnapshot = await getDocs(quizzesCollection)

    // Map the documents to Quiz objects
    const quizzes: Quiz[] = querySnapshot.docs.map(
      (doc) =>
        ({
          // Spread the document data
          ...doc.data(),
          // Ensure the ID is included
          id: doc.id,
        } as Quiz)
    )

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error('Error fetching quizzes from Firestore:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    )
  }
}
