import { NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'

export async function GET(
  request: Request,
  { params }: { params: { userId: string; projectId: string } }
) {
  try {
    const { userId, projectId } = params

    if (!userId || !projectId) {
      return NextResponse.json(
        { error: 'Missing userId or projectId' },
        { status: 400 }
      )
    }

    const projectRef = doc(fireStore, 'users', userId, 'projects', projectId)
    const projectDoc = await getDoc(projectRef)

    if (!projectDoc.exists()) {
      return NextResponse.json({
        completed: false,
        lastAttempt: null,
        totalAttempts: 0,
        successfulAttempts: 0,
      })
    }

    const data = projectDoc.data()
    return NextResponse.json({
      completed: data.completed || false,
      lastAttempt: data.lastAttempt || null,
      totalAttempts: data.totalAttempts || 0,
      successfulAttempts: data.successfulAttempts || 0,
    })
  } catch (error) {
    console.error('Error getting project progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project progress' },
      { status: 500 }
    )
  }
}
