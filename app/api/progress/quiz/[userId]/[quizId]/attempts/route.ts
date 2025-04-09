import { NextResponse } from 'next/server'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'

export async function GET(
  request: Request,
  props: { params: Promise<{ userId: string; quizId: string }> }
) {
  const params = await props.params;
  try {
    const { userId, quizId } = params
    const { searchParams } = new URL(request.url)
    const limitParam = parseInt(searchParams.get('limit') || '10')

    if (!userId || !quizId) {
      return NextResponse.json(
        { error: 'Missing userId or quizId' },
        { status: 400 }
      )
    }

    const attemptsRef = collection(
      fireStore,
      'users',
      userId,
      'quizzes',
      quizId,
      'attempts'
    )

    const attemptsQuery = query(
      attemptsRef,
      orderBy('timestamp', 'desc'),
      limit(limitParam)
    )

    const attemptsSnapshot = await getDocs(attemptsQuery)

    if (attemptsSnapshot.empty) {
      return NextResponse.json([])
    }

    const attempts = attemptsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toMillis() || Date.now(),
    }))

    return NextResponse.json(attempts)
  } catch (error) {
    console.error('Error getting quiz attempts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz attempts' },
      { status: 500 }
    )
  }
}
