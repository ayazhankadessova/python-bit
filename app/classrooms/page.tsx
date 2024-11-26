// // 'use client'
// // import React, { useState, useEffect } from 'react'
// // import { Search, Plus, Play } from 'lucide-react'
// // import { Input } from '@/components/ui/input'
// // import { Button } from '@/components/ui/button'
// // import {
// //   Card,
// //   CardHeader,
// //   CardTitle,
// //   CardDescription,
// //   CardContent,
// //   CardFooter,
// // } from '@/components/ui/card'
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogHeader,
// //   DialogTitle,
// //   DialogTrigger,
// // } from '@/components/ui/dialog'
// // import { CreateClassroomForm } from './CreateClassroomForm'
// // import { useToast } from '@/components/hooks/use-toast'
// // import { useRouter } from 'next/navigation'
// // import { Classroom } from '@/models/types'
// // import { Teacher } from '@/models/types'
// // import { useAuth } from '@/contexts/AuthContext'
// // import {
// //   collection,
// //   getDocs,
// //   query,
// //   where,
// //   writeBatch,
// //   doc,
// //   arrayUnion,
// // } from 'firebase/firestore'
// // import { fireStore } from '@/firebase/firebase'

// // const ClassroomPage = () => {
// //   const { toast } = useToast()
// //   const [searchTerm, setSearchTerm] = useState('')
// //   const [isLoading, setIsLoading] = useState(true)
// //   const [isDialogOpen, setIsDialogOpen] = useState(false)
// //   const [userData, setUserData] = useState<Teacher | null>(null)

// //   const router = useRouter()
// //   interface Classroom {
// //     id: string
// //     [key: string]: any
// //   }

// //   const [classrooms, setClassrooms] = useState<Classroom[]>([])
// //   const [loading, setLoading] = useState(true)
// //   const { user } = useAuth()

// //   // Protect the route
// //   useEffect(() => {
// //     if (user && user.role !== 'teacher') {
// //       router.push('/dashboard')
// //       toast({
// //         title: 'Unauthorized',
// //         description: 'Only teachers can create classrooms',
// //         variant: 'destructive',
// //       })
// //     }
// //   }, [user, router, toast])

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         // Fetch teacher's classrooms
// //         const classroomsQuery = query(
// //           collection(fireStore, 'classrooms'),
// //           where('teacherId', '==', user.uid)
// //           // orderBy('createdAt', 'desc')
// //         )
// //         const classroomsSnap = await getDocs(classroomsQuery)
// //         const classroomsData = classroomsSnap.docs.map((doc) => ({
// //           id: doc.id,
// //           ...doc.data(),
// //         }))
// //         setClassrooms(classroomsData)
// //       } catch (error) {
// //         console.error('Error fetching data:', error)
// //       } finally {
// //         setLoading(false)
// //       }
// //     }

// //     fetchData()
// //   }, [user.uid])

// //   if (loading) {
// //     return (
// //       <div className='flex items-center justify-center min-h-screen'>
// //         <Loader2 className='h-8 w-8 animate-spin' />
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className='container mx-auto p-6'>
// //       <div className='flex justify-between items-center mb-6'>
// //         <h1 className='text-3xl font-bold'>My Classrooms</h1>
// //         <Button variant='outline' onClick={() => router.push('/')}>
// //           Back to Dashboard
// //         </Button>
// //       </div>

// //       <div className='flex justify-between mb-6'>
// //         <div className='relative w-64'>
// //           <Search className='absolute left-2 top-2.5 h-4 w-4 text-gray-500' />
// //           <Input
// //             type='text'
// //             placeholder='Search classrooms'
// //             className='pl-8'
// //             value={searchTerm}
// //             onChange={(e) => setSearchTerm(e.target.value)}
// //           />
// //         </div>

// //         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
// //           <DialogTrigger asChild>
// //             <Button>
// //               <Plus className='mr-2 h-4 w-4' /> Create New Classroom
// //             </Button>
// //           </DialogTrigger>
// //           <DialogContent className='bg-white'>
// //             <DialogHeader>
// //               <DialogTitle>Create New Classroom</DialogTitle>
// //               <DialogDescription>
// //                 Fill in the details to create a new classroom.
// //               </DialogDescription>
// //             </DialogHeader>
// //             {userData && ( // Only render form if we have user data
// //               <CreateClassroomForm
// //                 onSubmit={handleCreateClassroom}
// //                 teacherId={userData._id}
// //                 teacherSchool={userData.school}
// //               />
// //             )}
// //           </DialogContent>
// //         </Dialog>
// //       </div>

// //       {filteredClassrooms.length === 0 ? (
// //         <div className='text-center py-10'>
// //           <p className='text-gray-500'>
// //             No classrooms found. Create your first classroom to get started!
// //           </p>
// //         </div>
// //       ) : (
// //         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
// //           {filteredClassrooms.map((classroom) => (
// //             <Card key={classroom._id}>
// //               <CardHeader>
// //                 <CardTitle>{classroom.name}</CardTitle>
// //                 <CardDescription>{classroom.curriculumName}</CardDescription>
// //               </CardHeader>
// //               <CardContent>
// //                 <p className='text-sm text-gray-600'>
// //                   Last taught: Week {classroom.lastTaughtWeek || 0}
// //                 </p>
// //                 <p className='text-sm text-gray-600'>
// //                   Students: {classroom.students?.length || 0}
// //                 </p>
// //               </CardContent>
// //               <CardFooter className='flex justify-between'>
// //                 <Button onClick={() => handleStartLesson(classroom._id)}>
// //                   <Play className='mr-2 h-4 w-4' /> Start Lesson
// //                 </Button>
// //               </CardFooter>
// //             </Card>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   )
// // }

// // export default ClassroomPage
// // First, let's define our types
// interface CreateClassroomFormData {
//   name: string
//   curriculumName: string
//   curriculumId: string
//   description?: string
// }

// interface Classroom {
//   _id: string
//   id?: string
//   name: string
//   teacherId: string
//   curriculumId: string
//   curriculumName: string
//   description?: string
//   lastTaughtWeek?: number
//   students?: string[]
//   studentIds?: string[]
//   classCode?: string
//   code?: string
//   createdAt: string
// }

// interface CreateClassroomFormProps {
//   onSubmit: (data: CreateClassroomFormData) => Promise<void>
// }

// ;
'use client'
import React, { useState, useEffect } from 'react'
import { Search, Plus, Play, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { CreateClassroomForm } from './CreateClassroomForm'
import { useToast } from '@/components/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'

const ClassroomPage = () => {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [classroomCode, setClassroomCode] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        let classroomsQuery

        if (user && user.role === 'teacher') {
          classroomsQuery = query(
            collection(fireStore, 'classrooms'),
            where('teacherId', '==', user.uid)
          )
        } else {
          classroomsQuery = query(
            collection(fireStore, 'classrooms'),
            where('studentIds', 'array-contains', user?.uid)
          )
        }

        const classroomsSnap = await getDocs(classroomsQuery)
        const classroomsData = classroomsSnap.docs.map((doc) => ({
          _id: doc.id,
          id: doc.id,
          ...doc.data(),
        })) as Classroom[]

        setClassrooms(classroomsData)
      } catch (error) {
        console.error('Error fetching classrooms:', error)
        toast({
          title: 'Error',
          description: 'Failed to load classrooms',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchClassrooms()
    }
  }, [user, toast])

  const handleCreateClassroom = async (formData: CreateClassroomFormData) => {
    try {
      const classroomData: Omit<Classroom, '_id'> = {
        ...formData,
        teacherId: user?.uid || '',
        studentIds: [],
        createdAt: new Date().toISOString(),
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      }

      await addDoc(collection(fireStore, 'classrooms'), classroomData)

      toast({
        title: 'Success',
        description: 'Classroom created successfully',
      })

      setIsDialogOpen(false)
      window.location.reload()
    } catch (error) {
      console.error('Error creating classroom:', error)
      toast({
        title: 'Error',
        description: 'Failed to create classroom',
        variant: 'destructive',
      })
    }
  }

  const handleJoinClassroom = async () => {
    try {
      const classroomQuery = query(
        collection(fireStore, 'classrooms'),
        where('code', '==', classroomCode.toUpperCase())
      )

      const classroomSnap = await getDocs(classroomQuery)

      if (classroomSnap.empty) {
        toast({
          title: 'Error',
          description: 'Invalid classroom code',
          variant: 'destructive',
        })
        return
      }

      const classroom = classroomSnap.docs[0]

      if (classroom.data().studentIds?.includes(user?.uid)) {
        toast({
          title: 'Error',
          description: 'You are already in this classroom',
          variant: 'destructive',
        })
        return
      }

      await updateDoc(doc(fireStore, 'classrooms', classroom.id), {
        studentIds: arrayUnion(user?.uid),
      })

      toast({
        title: 'Success',
        description: 'Successfully joined classroom',
      })

      setIsJoinDialogOpen(false)
      window.location.reload()
    } catch (error) {
      console.error('Error joining classroom:', error)
      toast({
        title: 'Error',
        description: 'Failed to join classroom',
        variant: 'destructive',
      })
    }
  }

  const handleStartLesson = (classroomId: string) => {
    router.push(`/classroom/${classroomId}/lesson`)
  }

  const filteredClassrooms = classrooms.filter((classroom) =>
    classroom.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>
          {user?.role === 'teacher'
            ? 'My Classrooms'
            : 'My Enrolled Classrooms'}
        </h1>
        <Button variant='outline' onClick={() => router.push('/')}>
          Back to Dashboard
        </Button>
      </div>

      <div className='flex justify-between mb-6'>
        <div className='relative w-64'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-gray-500' />
          <Input
            type='text'
            placeholder='Search classrooms'
            className='pl-8'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {user?.role === 'teacher' ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className='mr-2 h-4 w-4' /> Create New Classroom
              </Button>
            </DialogTrigger>
            <DialogContent className='bg-white'>
              <DialogHeader>
                <DialogTitle>Create New Classroom</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new classroom.
                </DialogDescription>
              </DialogHeader>
              <CreateClassroomForm
                // onSubmit={handleCreateClassroom}
                teacherId={user?.uid}
                teacherSchool={user?.school!}
              />
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className='mr-2 h-4 w-4' /> Join Classroom
              </Button>
            </DialogTrigger>
            <DialogContent className='bg-white'>
              <DialogHeader>
                <DialogTitle>Join Classroom</DialogTitle>
                <DialogDescription>
                  Enter the classroom code provided by your teacher.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder='Enter classroom code'
                value={classroomCode}
                onChange={(e) => setClassroomCode(e.target.value)}
              />
              <DialogFooter>
                <Button onClick={handleJoinClassroom}>Join</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {filteredClassrooms.length === 0 ? (
        <div className='text-center py-10'>
          <p className='text-gray-500'>
            {user?.role === 'teacher'
              ? 'No classrooms found. Create your first classroom to get started!'
              : 'No classrooms found. Join a classroom to get started!'}
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredClassrooms.map((classroom) => (
            <Card key={classroom._id}>
              <CardHeader>
                <CardTitle>{classroom.name}</CardTitle>
                <CardDescription>{classroom.curriculumName}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-gray-600'>
                  {user?.role === 'teacher' && (
                    <>
                      Classroom Code: {classroom.code}
                      <br />
                    </>
                  )}
                  Last taught: Week {classroom.lastTaughtWeek || 0}
                </p>
                <p className='text-sm text-gray-600'>
                  Students: {classroom.studentIds?.length || 0}
                </p>
              </CardContent>
              <CardFooter className='flex justify-between'>
                <Button onClick={() => handleStartLesson(classroom._id)}>
                  <Play className='mr-2 h-4 w-4' /> Start Lesson
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ClassroomPage
