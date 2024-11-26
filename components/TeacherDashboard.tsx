// import { useRouter } from 'next/navigation'
// import { Teacher } from '@/models/types'
// import { Button } from '@/components/ui/button'
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from '@/components/ui/card'

// interface TeacherDashboardProps {
//   user: Teacher
//   onSignOut: () => void
// }

// export function TeacherDashboard({ user, onSignOut }: TeacherDashboardProps) {
//   const router = useRouter()

//   return (
//     <div className='container mx-auto p-6'>
//       <div className='mb-8 flex justify-between items-center'>
//         <div>
//           <h1 className='text-4xl font-bold mb-2'>
//             Welcome back, {user.username}!
//           </h1>
//           <p className='text-gray-600'>Here's your teaching overview</p>
//         </div>
//         <Button variant='outline' onClick={onSignOut}>
//           Sign Out
//         </Button>
//       </div>

//       <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
//         <Card>
//           <CardHeader>
//             <CardTitle>Quick Actions</CardTitle>
//           </CardHeader>
//           <CardContent className='space-y-4'>
//             <Button
//               className='w-full'
//               onClick={() => router.push('/classrooms')}
//             >
//               View My Classrooms
//             </Button>
//             <Button
//               variant='outline'
//               className='w-full'
//               onClick={() => router.push('/classrooms')}
//             >
//               Create New Classroom
//             </Button>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Activity</CardTitle>
//             <CardDescription>Your latest teaching activities</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className='space-y-4'>
//               <p className='text-sm text-gray-500'>No recent activity</p>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Teaching Stats</CardTitle>
//             <CardDescription>Your teaching metrics</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className='space-y-4'>
//               <div>
//                 <p className='text-sm font-medium'>School Name</p>
//                 <p className='text-2xl font-bold'>{user.school}</p>
//               </div>
//               <div>
//                 <p className='text-sm font-medium'>Active Classrooms</p>
//                 <p className='text-2xl font-bold'>
//                   {user.classrooms?.length || 0}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }
// components/TeacherDashboard.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { Loader2, Book, Users, Trophy } from 'lucide-react'

interface TeacherDashboardProps {
  user: any
  onSignOut: () => void
}

export function TeacherDashboard({ user, onSignOut }: TeacherDashboardProps) {
  const router = useRouter()
  interface Classroom {
    id: string
    [key: string]: any
  }

  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teacher's classrooms
        const classroomsQuery = query(
          collection(fireStore, 'classrooms'),
          where('teacherId', '==', user.uid)
          // orderBy('createdAt', 'desc')
        )
        const classroomsSnap = await getDocs(classroomsQuery)
        const classroomsData = classroomsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setClassrooms(classroomsData)

        // // Fetch recent activities
        // const activitiesQuery = query(
        //   collection(fireStore, 'activities'),
        //   where('teacherId', '==', user.uid),
        //   orderBy('timestamp', 'desc'),
        //   limit(5)
        // )
        // const activitiesSnap = await getDocs(activitiesQuery)
        // const activitiesData = activitiesSnap.docs.map((doc) => ({
        //   id: doc.id,
        //   ...doc.data(),
        // }))
        // setRecentActivities(activitiesData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user.uid])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-8 flex justify-between items-center'>
        <div>
          <h1 className='text-4xl font-bold mb-2'>
            Welcome back, {user.displayName}!
          </h1>
          <p className='text-gray-600'>Here's your teaching overview</p>
        </div>
        <Button variant='outline' onClick={onSignOut}>
          Sign Out
        </Button>
      </div>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Book className='h-5 w-5' />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Button
              className='w-full'
              onClick={() => router.push('/classrooms')}
            >
              View My Classrooms ({classrooms.length})
            </Button>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => router.push('/classroom/create')}
            >
              Create New Classroom
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Trophy className='h-5 w-5' />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity: any) => (
                  <div key={activity.id} className='text-sm'>
                    <p className='font-medium'>{activity.description}</p>
                    <p className='text-gray-500'>
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className='text-sm text-gray-500'>No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              Teaching Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <p className='text-sm font-medium'>School</p>
                <p className='text-2xl font-bold'>{user.school}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Active Classrooms</p>
                <p className='text-2xl font-bold'>{classrooms.length}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Total Students</p>
                <p className='text-2xl font-bold'>
                  {classrooms.reduce(
                    (acc: number, classroom: any) =>
                      acc + (classroom.students?.length || 0),
                    0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
