// app/api/classrooms/route.ts
import { NextResponse } from 'next/server'
import { fireStore } from '@/firebase/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { unstable_cache } from 'next/cache'
import { ClassroomTC } from '@/types/firebase'

interface ClassroomsResponse {
  classrooms: ClassroomTC[]
  error?: string
}

async function _fetchClassroomData(userId: string) {
  try {
    const userDoc = await getDoc(doc(fireStore, 'users', userId))
    if (!userDoc.exists()) {
      return { classrooms: [], error: 'User not found' }
    }

    const userData = userDoc.data()
    if (!userData.classrooms || userData.classrooms.length === 0) {
      return { classrooms: [] }
    }

    const classroomsData = await Promise.all(
      userData.classrooms.map(async (classroomId: string) => {
        try {
          const classroomDoc = await getDoc(
            doc(fireStore, 'classrooms', classroomId)
          )
          if (!classroomDoc.exists()) return null

          const classroomData = classroomDoc.data()

          return {
            id: classroomDoc.id,
            ...classroomData,
          } as ClassroomTC
        } catch (error) {
          console.error(`Error fetching classroom ${classroomId}:`, error)
          return null
        }
      })
    )

    const validClassrooms = classroomsData.filter(
      (c): c is ClassroomTC => c !== null
    )
    return { classrooms: validClassrooms }
  } catch (error) {
    return { classrooms: [], error: 'Failed to fetch classroom data' + error }
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return new Response('User ID is required', { status: 400 })
  }

  const cacheKey = `/api/classrooms?userId=${userId}`
  const result = await unstable_cache(
    async () => _fetchClassroomData(userId),
    [cacheKey],
    { revalidate: 600 } // Cache for 10 mins
  )()

  if (result.error) {
    // Convert error to string
    return new Response(JSON.stringify({ error: result.error }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  return NextResponse.json<ClassroomsResponse>(result)
}
