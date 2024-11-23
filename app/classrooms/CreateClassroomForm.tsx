import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Student } from '@/models/types'

interface Curriculum {
  _id: string
  name: string
}

const formSchema = z.object({
  name: z.string().min(1, 'Classroom name is required'),
  curriculumId: z
    .string()
    .min(24, 'Curriculum ID must be 24 characters')
    .max(24, 'Curriculum ID must be 24 characters'),
  curriculumName: z.string().min(1, 'Curriculum name is required'),
  students: z.array(z.string()).min(1, 'At least one student must be selected'),
})

type FormData = z.infer<typeof formSchema>

interface CreateClassroomFormProps {
  onSubmit: (data: FormData & { teacherId: string }) => void
  teacherId: string
  teacherSchool: string
}

export function CreateClassroomForm({
  onSubmit,
  teacherId,
  teacherSchool,
}: CreateClassroomFormProps) {
  const [curricula, setCurricula] = useState<Curriculum[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      curriculumId: '',
      curriculumName: '',
      students: [],
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        setIsLoading(true)

        // Fetch curricula
        const curriculaResponse = await fetch('/api/curriculum', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!curriculaResponse.ok) throw new Error('Failed to fetch curricula')
        const curriculaData = await curriculaResponse.json()
        setCurricula(curriculaData)

        // Fetch students
        // In CreateClassroomForm
        const studentsResponse = await fetch(
          `/api/users?role=student&school=${encodeURIComponent(teacherSchool)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        if (!studentsResponse.ok) throw new Error('Failed to fetch students')
        const studentsData = await studentsResponse.json()

        setFilteredStudents(studentsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [teacherSchool])

  const handleStudentToggle = (studentId: string) => {
    const currentStudents = form.getValues('students')
    const updatedStudents = currentStudents.includes(studentId)
      ? currentStudents.filter((id) => id !== studentId)
      : [...currentStudents, studentId]

    form.setValue('students', updatedStudents, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const handleSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      teacherId,
    })
  }

  if (isLoading) {
    return <div className='p-4 text-center'>Loading...</div>
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className='space-y-8 bg-white p-6 rounded-lg shadow'
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Classroom Name</FormLabel>
              <FormControl>
                <Input placeholder='Grade 7A' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='curriculumId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Study Program</FormLabel>
              <Select
                onValueChange={(value) => {
                  const selectedCurriculum = curricula.find(
                    (c) => c._id === value
                  )
                  if (selectedCurriculum) {
                    form.setValue('curriculumId', value)
                    form.setValue('curriculumName', selectedCurriculum.name)
                  }
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a study programme to follow' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {curricula.map((curriculum) => (
                    <SelectItem key={curriculum._id} value={curriculum._id}>
                      {curriculum.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='students'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Students from {teacherSchool}</FormLabel>
              <FormControl>
                <div className='flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 border rounded-md'>
                  {filteredStudents.length === 0 ? (
                    <p className='text-sm text-muted-foreground'>
                      No students available from {teacherSchool}
                    </p>
                  ) : (
                    filteredStudents.map((student) => (
                      <Button
                        key={student._id}
                        type='button'
                        variant={
                          field.value.includes(student._id)
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => handleStudentToggle(student._id)}
                        className='flex-grow-0'
                      >
                        {student.username}
                        {` (Grade ${student.grade})`}
                      </Button>
                    ))
                  )}
                </div>
              </FormControl>
              <p className='text-sm text-muted-foreground mt-2'>
                {field.value.length} student(s) selected
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          className='w-full'
          disabled={isLoading || filteredStudents.length === 0}
        >
          Create Classroom
        </Button>
      </form>
    </Form>
  )
}
