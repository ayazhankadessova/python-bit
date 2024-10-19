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

const formSchema = z.object({
  name: z.string().min(1, 'Classroom name is required'),
  teacherId: z.string().min(1, 'Teacher ID is required'),
  curriculumId: z.string().min(1, 'Curriculum selection is required'),
  curriculumName: z.string().min(1, 'Curriculum name is required'),
})

type FormData = z.infer<typeof formSchema>

interface Curriculum {
  _id: string
  name: string
}

interface CreateClassroomFormProps {
  onSubmit: (data: FormData) => void
}

export function CreateClassroomForm({ onSubmit }: CreateClassroomFormProps) {
  const [curricula, setCurricula] = useState<Curriculum[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      teacherId: '',
      curriculumId: '',
      curriculumName: '',
    },
  })

  useEffect(() => {
    fetch('/api/curriculum')
      .then((response) => response.json())
      .then((data: Curriculum[]) => setCurricula(data))
      .catch((error) => console.error('Error fetching curricula:', error))
  }, [])

  const handleSubmit = (data: FormData) => {
    onSubmit(data)
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
                <Input placeholder='teacher123' {...field} />
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
        <Button type='submit'>Create Classroom</Button>
      </form>
    </Form>
  )
}
