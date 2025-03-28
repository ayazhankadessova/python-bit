// app/api/quiz/[id]/route.ts

import { NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
// import { Quiz } from '@/types/quiz/quiz'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const quizId = params.id
  console.log('Attempting to fetch quiz with ID:', quizId)

  try {
    // Log the full reference path
    console.log('Firestore reference path:', `quizzes/${quizId}`)

    const quizDocRef = doc(fireStore, 'quizzes', quizId)
    const quizDocSnap = await getDoc(quizDocRef)

    console.log('Document exists:', quizDocSnap.exists())
    console.log('Document data:', quizDocSnap.data())

    // Rest of your existing code...
  } catch (error) {
    console.error('Full error details:', error)
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
  }
}