import { ClassroomTC } from '@/types/firebase'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import React, { useEffect, useState } from 'react'
import { fireStore } from '@/firebase/firebase'
import { getDoc, doc } from 'firebase/firestore'
import { Curriculum } from '@/types/classrooms/live-session'

interface ClassroomCardProps {
  classroom: ClassroomTC
  actionButton: React.ReactNode
}

export function ClassroomCard({
  classroom,
  actionButton,
}: ClassroomCardProps) {

  const [curriculumName, setCurriculumName] = useState('')

    useEffect(() => {
      const fetchClassroomAndCurriculum = async () => {
        try {
          // Fetch classroom data first
          const classroomDoc = await getDoc(
            doc(fireStore, 'classrooms', classroom.id)
          )

          if (!classroomDoc.exists()) {
            throw new Error('Classroom not found')
          }

          const classroomData = classroomDoc.data() as ClassroomTC

          // Fetch curriculum using the classroom's curriculumId
          const curriculumDoc = await getDoc(
            doc(fireStore, 'curricula', classroomData.curriculumId)
          )

          if (!curriculumDoc.exists()) {
            throw new Error('Curriculum not found')
          }

          const curriculumData = curriculumDoc.data() as Curriculum
          setCurriculumName(curriculumData.name)
          
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }

      if (classroom) {
        fetchClassroomAndCurriculum()
      }
    }, [classroom])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{classroom.name}</CardTitle>
        <CardDescription>{curriculumName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <p className='text-muted-foreground'>
            Last taught: Week {classroom.lastTaughtWeek || 0}
          </p>
          <p className='text-muted-foreground'>
            Students: {classroom.students?.length || 0}
          </p>
        </div>
      </CardContent>
      <CardFooter className='flex justify-between'>{actionButton}</CardFooter>
    </Card>
  )
}
