import { ClassroomTC } from '@/types/firebase'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { fireStore } from '@/firebase/firebase'
import { getDoc, doc } from 'firebase/firestore'
import { Curriculum } from '@/types/classrooms/live-session'
import { Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ClassroomCardProps {
  classroom: ClassroomTC
  actionButton: React.ReactNode
  variant?: 'default' | 'dashboard'
  role: 'student' | 'teacher'
}

export function ClassroomCard({
  classroom,
  actionButton,
  variant = 'default',
  role = 'student'
}: ClassroomCardProps) {
  const [curriculumName, setCurriculumName] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    const fetchClassroomAndCurriculum = async () => {
      try {
        const classroomDoc = await getDoc(
          doc(fireStore, 'classrooms', classroom.id)
        )
        if (!classroomDoc.exists()) {
          throw new Error('Classroom not found')
        }
        const classroomData = classroomDoc.data() as ClassroomTC

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

  const copyClassCode = () => {
    if (classroom.classCode) {
      navigator.clipboard.writeText(classroom.classCode)
      toast({
        title: 'Copied!',
        description: 'Class code copied to clipboard',
      })
    }
  }

  const ClassCodeSection = () => {
    if (role !== 'teacher' || !classroom.classCode) return null

    return (
      <div className='flex items-center gap-2'>
        <p className='text-sm text-muted-foreground'>
          Class Code: {classroom.classCode}
        </p>
        <Button
          variant='ghost'
          size='sm'
          className='h-6 w-6 p-0'
          onClick={copyClassCode}
        >
          <Copy className='h-4 w-4' />
        </Button>
      </div>
    )
  }

  if (variant === 'dashboard') {
    return (
      <Card className='p-4'>
        <div className='space-y-3'>
          <div className='space-y-2'>
            <h3 className='font-semibold'>{classroom.name}</h3>
            <p className='text-sm text-muted-foreground'>
              Program: {curriculumName}
            </p>
            <ClassCodeSection />
          </div>
          <div className='pt-2 flex justify-end'>{actionButton}</div>
        </div>
      </Card>
    )
  }

  return (
    <Card className='flex flex-col h-full'>
      <CardHeader className='pb-2'>
        <div className='space-y-1'>
          <h3 className='font-semibold tracking-tight text-lg'>
            {classroom.name}
          </h3>
          <p className='text-sm text-muted-foreground'>
            Program: {curriculumName}
          </p>
          <ClassCodeSection />
        </div>
      </CardHeader>
      <CardContent className='flex-1'>
        <div className='space-y-2'>
          <p className='text-sm'>Students: {classroom.students?.length || 0}</p>
        </div>
      </CardContent>
      <CardFooter className='mt-auto pt-2'>
        <div className='w-full flex justify-end'>{actionButton}</div>
      </CardFooter>
    </Card>
  )
}
