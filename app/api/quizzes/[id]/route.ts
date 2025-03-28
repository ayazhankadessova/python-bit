// import { NextResponse } from 'next/server'
// import { doc, getDoc } from 'firebase/firestore'
// import { fireStore } from '@/firebase/firebase'
// // import { Quiz } from '@/types/quiz/quiz'

// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   const quizId = params.id
//   console.log('Attempting to fetch quiz with ID:', quizId)

//   try {
//     // Log the full reference path
//     console.log('Firestore reference path:', `quizzes/${quizId}`)

//     const quizDocRef = doc(fireStore, 'quizzes', quizId)
//     const quizDocSnap = await getDoc(quizDocRef)

//     // Check if the document exists
//     if (!quizDocSnap.exists()) {
//       console.log('Quiz not found:', quizId)
//       return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
//     }

//     // Log the document data
//     const quizData = quizDocSnap.data()
//     console.log('Document exists:', quizDocSnap.exists())
//     console.log('Document data:', quizData)

//     // Return the quiz data along with the document ID
//     const quiz = {
//       ...quizData,
//       id: quizDocSnap.id,
//     }

//     return NextResponse.json(quiz)
//   } catch (error) {
//     console.error('Full error details:', error)
//     return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
//   }
// }
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