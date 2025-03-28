// // app/api/quiz/{id}

// import { NextResponse } from 'next/server'
// import { doc, getDoc } from 'firebase/firestore'
// import { fireStore } from '@/firebase/firebase'
// import { Quiz } from '@/types/quiz/quiz'

// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const quizId = params.id

//     // Reference to the specific quiz document in Firestore
//     const quizDocRef = doc(fireStore, 'quizzes', quizId)

//     // Fetch the document
//     const quizDocSnap = await getDoc(quizDocRef)

//     // Check if the document exists
//     if (!quizDocSnap.exists()) {
//       return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
//     }

//     // Get the document data and include the ID
//     const quiz: Quiz = {
//       ...quizDocSnap.data(),
//       id: quizDocSnap.id,
//     } as Quiz

//     return NextResponse.json(quiz)
//   } catch (error) {
//     console.error('Error fetching quiz from Firestore:', error)
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
