'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  doc,
  arrayUnion,
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Props {
  teacherId: string
  teacherSchool: string
}

interface Curriculum {
  id: string
  name?: string
}

interface Student {
  id: string
  displayName?: string
  email?: string
  grade?: number
}

const formSchema = z.object({
  name: z.string().min(1, 'Classroom name is required'),
  curriculumId: z.string().min(1, 'Curriculum is required'),
  students: z.array(z.string()).min(1, 'At least one student must be selected'),
})

const generateClassCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Function to ensure the generated code is unique
const getUniqueClassCode = async () => {
  let code = generateClassCode()
  let isUnique = false

  while (!isUnique) {
    // Check if code exists in Firestore
    const codeQuery = query(
      collection(fireStore, 'classrooms'),
      where('classCode', '==', code)
    )
    const codeSnapshot = await getDocs(codeQuery)

    if (codeSnapshot.empty) {
      isUnique = true
    } else {
      code = generateClassCode()
    }
  }

  return code
}

export function CreateClassroomForm({ teacherId, teacherSchool }: Props) {
  const [curricula, setCurricula] = useState<Curriculum[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      curriculumId: '',
      students: [],
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const curriculaSnap = await getDocs(collection(fireStore, 'curricula'))
        setCurricula(
          curriculaSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        )

        const studentsQuery = query(
          collection(fireStore, 'users'),
          where('role', '==', 'student'),
          where('school', '==', teacherSchool)
        )
        const studentsSnap = await getDocs(studentsQuery)
        setStudents(
          studentsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        )
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load curricula and students',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [teacherSchool, toast])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const batch = writeBatch(fireStore)

      const classCode = await getUniqueClassCode()

      // Create classroom document
      const classroomRef = doc(collection(fireStore, 'classrooms'))
      batch.set(classroomRef, {
        id: classroomRef.id,
        classCode: classCode,
        name: data.name,
        teacherId,
        curriculumId: data.curriculumId,
        students: data.students, // Using studentIds instead of students for clarity
        lastTaughtWeek: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      // Update teacher's classrooms array
      const teacherRef = doc(fireStore, 'users', teacherId)
      batch.update(teacherRef, {
        classrooms: arrayUnion(classroomRef.id),
      })

      // Update students' classrooms arrays
      data.students.forEach((studentId) => {
        const studentRef = doc(fireStore, 'users', studentId)
        batch.update(studentRef, {
          classrooms: arrayUnion(classroomRef.id),
        })
      })

      await batch.commit()

      toast({
        title: 'Success',
        description: 'Classroom created successfully',
      })

      form.reset()

      // Optional: Refresh the page or redirect
      // window.location.reload()
    } catch (error) {
      console.error('Error creating classroom:', error)
      toast({
        title: 'Error',
        description: 'Failed to create classroom',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStudentToggle = (studentId: string) => {
    const currentStudents = form.getValues('students')
    const updatedStudents = currentStudents.includes(studentId)
      ? currentStudents.filter((id) => id !== studentId)
      : [...currentStudents, studentId]

    form.setValue('students', updatedStudents, {
      shouldValidate: true,
    })
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Classroom Name</FormLabel>
              <FormControl>
                <Input placeholder='Python Afternoon Class' {...field} />
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
              <FormLabel>Curriculum</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a curriculum' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {curricula.map((curriculum) => (
                    <SelectItem key={curriculum.id} value={curriculum.id}>
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
                <div className='flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 border rounded-md bg-gradient-to-r from-[hsl(var(--background-start))] to-[hsl(var(--background-end))]'>
                  {students.length === 0 ? (
                    <p className='text-sm text-muted-foreground p-2'>
                      No students available from {teacherSchool}
                    </p>
                  ) : (
                    students.map((student) => (
                      <Button
                        key={student.id}
                        type='button'
                        variant={
                          field.value.includes(student.id)
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => handleStudentToggle(student.id)}
                        className='flex-grow-0'
                      >
                        {student.displayName}
                        {student.grade && ` (Grade ${student.grade})`}
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
          disabled={loading || students.length === 0}
        >
          {loading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Creating Classroom...
            </>
          ) : (
            'Create Classroom'
          )}
        </Button>
      </form>
    </Form>
  )
}
