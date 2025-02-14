// app/classroom/create/page.tsx
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
  setDoc,
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { nanoid } from 'nanoid'
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
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Curriculum, Week } from '@/types/classrooms/live-session'

interface Student {
  id: string
  displayName: string
  email: string
  grade?: number
}

const formSchema = z.object({
  name: z.string().min(1, 'Classroom name is required'),
  curriculumId: z.string().min(1, 'Curriculum is required'),
  students: z.array(z.string()).min(1, 'At least one student must be selected'),
})

export default function CreateClassroomPage() {
  const [curricula, setCurricula] = useState<CurriculumWithId[]>([]);
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  interface CurriculumWithId extends Curriculum {
  id: string;  // Adding id for Firestore document reference
}

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      curriculumId: '',
      students: [],
    },
  })

  // Protect the route
  useEffect(() => {
    if (user && user.role !== 'teacher') {
      router.push('/dashboard')
      toast({
        title: 'Unauthorized',
        description: 'Only teachers can create classrooms',
        variant: 'destructive',
      })
    }
  }, [user, router, toast])

  // Update the fetchData function in y our useEffect
useEffect(() => {
  const fetchData = async () => {
    if (!user?.school) return;

    try {
      // Fetch curricula
      const curriculaSnap = await getDocs(collection(fireStore, 'curricula'));
      const fetchedCurricula = curriculaSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          weeks: data.weeks.map((week: Week) => ({
            weekNumber: week.weekNumber,
            title: week.title,
            assignmentIds: week.assignmentIds,
          })),
        } as CurriculumWithId;
      });
      
      setCurricula(fetchedCurricula);

      // Fetch students code remains the same
      const studentsQuery = query(
        collection(fireStore, 'users'),
        where('role', '==', 'student'),
        where('school', '==', user.school)
      );
      const studentsSnap = await getDocs(studentsQuery);
      setStudents(
        studentsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Student[]
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    fetchData();
  }
}, [user, toast]);

  const handleStudentToggle = (studentId: string) => {
    const currentStudents = form.getValues('students')
    const updatedStudents = currentStudents.includes(studentId)
      ? currentStudents.filter((id) => id !== studentId)
      : [...currentStudents, studentId]

    form.setValue('students', updatedStudents, {
      shouldValidate: true,
    })
  }

  // Only showing the modified onSubmit function since the rest remains the same
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) return

    try {
      setLoading(true)
      const batch = writeBatch(fireStore)

      const classroomId = nanoid()
      const classCode = nanoid(6).toUpperCase()

      // Create classroom document
      const classroomRef = doc(fireStore, 'classrooms', classroomId)
      batch.set(classroomRef, {
        id: classroomId,
        name: data.name,
        teacherId: user.uid,
        curriculumId: data.curriculumId,
        curriculumName: curricula.find((c) => c.id === data.curriculumId)?.name,
        students: data.students,
        classCode,
        lastTaughtWeek: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        school: user.school,
      })

      // Initialize sessions subcollection with a metadata document
      // This ensures the collection exists and contains useful information
      const sessionsMetadataRef = doc(
        fireStore,
        `classrooms/${classroomId}/sessions`,
        '_metadata'
      )
      batch.set(sessionsMetadataRef, {
        createdAt: Date.now(),
        totalSessions: 0,
        lastSessionAt: null,
        isInitialized: true,
        // Add any other metadata fields you might need
      })

      // Update teacher's classrooms
      const teacherRef = doc(fireStore, 'users', user.uid)
      batch.update(teacherRef, {
        classrooms: arrayUnion(classroomId),
        updatedAt: Date.now(),
      })

      // Update students' enrollments
      data.students.forEach((studentId) => {
        const studentRef = doc(fireStore, 'users', studentId)
        batch.update(studentRef, {
          classrooms: arrayUnion(classroomId),
          updatedAt: Date.now(),
        })
      })

      await batch.commit()

      const indexRef = doc(
        fireStore,
        `classrooms/${classroomId}/.indexes/sessions`
      )
      await setDoc(indexRef, {
        fields: {
          endedAt: 'ASCENDING',
          startedAt: 'DESCENDING',
        },
        queryScope: 'COLLECTION',
      })

      toast({
        title: 'Success',
        description: 'Classroom created successfully',
      })

      router.push('/dashboard')
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

  if (!user || user.role !== 'teacher') {
    return null
  }

  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center'>
      <div className='w-full max-w-2xl'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-bold text-gray-900'>Create Classroom</h2>
          <p className='mt-2 text-gray-600'>
            Create a new classroom for {user.school}
          </p>
        </div>

        {loading ? (
          <div className='flex items-center justify-center min-h-[400px]'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-200'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classroom Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Python Afternoon Class'
                        className='bg-gray-50 border-gray-300'
                        {...field}
                      />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className='bg-gray-50 border-gray-300'>
                          <SelectValue placeholder='Select a curriculum' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {curricula.map((curriculum) => (
                          <SelectItem key={curriculum.id} value={curriculum.id}>
                            <div>
                              <div>{curriculum.name}</div>
                              {curriculum.description && (
                                <div className='text-sm text-gray-500'>
                                  {curriculum.description}
                                </div>
                              )}
                            </div>
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
                      <div className='flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 border rounded-md bg-gray-50'>
                        {students.length === 0 ? (
                          <p className='text-sm text-gray-500 p-2'>
                            No students available from {user.school}
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
                    <p className='text-sm text-gray-500 mt-2'>
                      {field.value.length} student(s) selected
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type='submit'
                className='w-full bg-brand-orange hover:bg-brand-orange-s'
                disabled={loading}
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
        )}
      </div>
    </div>
  )
}
