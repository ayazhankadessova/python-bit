import React from 'react'
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

const formSchema = z.object({
  name: z.string().min(1, 'Classroom name is required'),
  teacherId: z.string().min(1, 'Teacher ID is required'),
  curriculumId: z.string().min(1, 'Curriculum ID is required'),
  curriculumName: z.string().min(1, 'Curriculum name is required'),
})

interface CreateClassroomFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void
}

export function CreateClassroomForm({ onSubmit }: CreateClassroomFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      teacherId: '',
      curriculumId: '',
      curriculumName: '',
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8 bg-white'
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
              <FormLabel>Curriculum ID</FormLabel>
              <FormControl>
                <Input placeholder='curriculum456' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='curriculumName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Curriculum Name</FormLabel>
              <FormControl>
                <Input placeholder='Python for Beginners' {...field} />
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
