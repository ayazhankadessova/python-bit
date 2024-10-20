import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
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

const formSchema = z.object({
  name: z.string().min(1, 'Classroom name is required'),
  teacherId: z
    .string()
    .min(24, 'Teacher ID must be 24 characters')
    .max(24, 'Teacher ID must be 24 characters'),
  curriculumId: z
    .string()
    .min(24, 'Curriculum ID must be 24 characters')
    .max(24, 'Curriculum ID must be 24 characters'),
  curriculumName: z.string().min(1, 'Curriculum name is required'),
  students: z.array(z.string()).min(1, 'At least one student must be selected'),
})

type FormData = z.infer<typeof formSchema>

interface Curriculum {
  _id: string
  name: string
}

interface User {
  _id: string
  id: string
  username: string
  email: string
  role: string
}

interface CreateClassroomFormProps {
  onSubmit: (data: FormData) => void
}

export function CreateClassroomForm({ onSubmit }: CreateClassroomFormProps) {
  const [curricula, setCurricula] = useState<Curriculum[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      teacherId: '',
      curriculumId: '',
      curriculumName: '',
      students: [],
    },
  })

  useEffect(() => {
    fetch('/api/curriculum')
      .then((response) => response.json())
      .then((data: Curriculum[]) => setCurricula(data))
      .catch((error) => console.error('Error fetching curricula:', error))

    fetch('/api/users')
      .then((response) => response.json())
      .then((data: User[]) =>
        setStudents(data.filter((user) => user.role === 'student'))
      )
      .catch((error) => console.error('Error fetching users:', error))
  }, [])

  const handleSubmit = (data: FormData) => {
    onSubmit({ ...data, students: selectedStudents })
  }

  const handleStudentSelect = (username: string) => {
    setSelectedStudents((prev) => {
      const newSelection = prev.includes(username)
        ? prev.filter((s) => s !== username)
        : [...prev, username]
      form.setValue('students', newSelection)
      return newSelection
    })
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
          name='teacherId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teacher ID</FormLabel>
              <FormControl>
                <Input placeholder='24-character Teacher ID' {...field} />
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
              <FormLabel>Students</FormLabel>
              <FormControl>
                <div className='flex flex-wrap gap-2'>
                  {students.map((student) => (
                    <Button
                      key={student._id}
                      type='button'
                      variant={
                        selectedStudents.includes(student.username)
                          ? 'default'
                          : 'outline'
                      }
                      onClick={() => handleStudentSelect(student.username)}
                    >
                      {student.username}
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit'>Create Classroom</Button>
      </form>
    </Form>
  )
}
