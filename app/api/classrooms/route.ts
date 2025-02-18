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
    // Get user document
    const userDoc = await getDoc(doc(fireStore, 'users', userId))

    if (!userDoc.exists()) {
      console.log(`User ${userId} not found`)
      return { classrooms: [] }
    }

    const userData = userDoc.data()

    // If no classrooms, return empty array (not an error condition)
    if (!userData.classrooms || userData.classrooms.length === 0) {
      console.log(`No classrooms found for user ${userId}`)
      return { classrooms: [] }
    }

    // Fetch all classroom documents
    const classroomsData = await Promise.all(
      userData.classrooms.map(async (classroomId: string) => {
        try {
          const classroomDoc = await getDoc(
            doc(fireStore, 'classrooms', classroomId)
          )

          if (!classroomDoc.exists()) {
            console.log(`Classroom ${classroomId} not found`)
            return null
          }

          const classroomData = classroomDoc.data()
          return {
            id: classroomDoc.id,
            ...classroomData,
          } as ClassroomTC
        } catch (error) {
          console.error(
            `Error fetching classroom ${classroomId}:`,
            error instanceof Error ? error.message : 'Unknown error'
          )
          return null
        }
      })
    )

    const validClassrooms = classroomsData.filter(
      (c): c is ClassroomTC => c !== null
    )

    console.log(
      `Successfully fetched ${validClassrooms.length} classrooms for user ${userId}`
    )
    return { classrooms: validClassrooms }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error(`Failed to fetch classroom data: ${errorMessage}`)
    throw error // Let the main handler deal with the error
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const cacheKey = `/api/classrooms?userId=${userId}`
    const result = await unstable_cache(
      async () => _fetchClassroomData(userId),
      [cacheKey],
      { revalidate: 60 } // Cache for 1 min
    )()

    // Successful response
    return NextResponse.json<ClassroomsResponse>({
      classrooms: result.classrooms,
    })
  } catch (error) {
    console.error(
      'API Error:',
      error instanceof Error ? error.message : 'Unknown error'
    )

    return NextResponse.json(
      {
        error: 'Failed to fetch classroom data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
