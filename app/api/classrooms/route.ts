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

          let curriculumData = undefined
          try {
            const curriculumDoc = await getDoc(
              doc(fireStore, 'curricula', classroomData.curriculumId)
            )
            if (curriculumDoc.exists()) {
              curriculumData = curriculumDoc.data()
            }
          } catch (error) {
            console.error('Error fetching curriculum:', error)
          }

          return {
            id: classroomDoc.id,
            ...classroomData,
            curriculum: curriculumData,
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
    return { classrooms: [], error: error }
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
    return new Response(result.error, { status: 500 })
  }

  return NextResponse.json<ClassroomsResponse>(result)
}
