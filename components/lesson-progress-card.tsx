// import React, { useState, useEffect } from 'react'
// import { RefreshCw } from 'lucide-react'
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { useToast } from '@/hooks/use-toast'

// import { LessonProgressCardProps, WeeklyProgress } from '@/models/types'

// export const LessonProgressCard: React.FC<LessonProgressCardProps> = ({
//   classroomId,
//   weekNumber,
//   tasks,
//   classroom,
// }) => {
//   const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(
//     null
//   )
//   const [isLoading, setIsLoading] = useState(false)
//   const { toast } = useToast()

//   const fetchWeeklyProgress = async () => {
//     if (weekNumber === null) {
//       toast({
//         title: 'Week not selected',
//         description: 'Please choose a week first.',
//         variant: 'destructive',
//       })
//       return
//     }

//     setIsLoading(true)
//     try {
//       const progressResponse = await fetch(
//         `/api/weekly-progress?classroomId=${classroomId}&weekNumber=${weekNumber}`
//       )
//       if (!progressResponse.ok) {
//         throw new Error('Failed to fetch weekly progress')
//       }
//       const progressData: WeeklyProgress = await progressResponse.json()
//       setWeeklyProgress(progressData)
//     } catch (error) {
//       console.error('Error fetching weekly progress:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to fetch weekly progress. Please try again.',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (weekNumber !== null) {
//       fetchWeeklyProgress()
//     }
//   }, [classroomId, weekNumber])

//   const handleRefresh = () => {
//     fetchWeeklyProgress()
//   }

//   return (
//     <Card className='mb-4'>
//       <CardHeader className='flex flex-row items-center justify-between'>
//         <CardTitle>Current Lesson Progress</CardTitle>
//         <Button
//           variant='outline'
//           size='icon'
//           onClick={handleRefresh}
//           //   disabled={isLoading || weekNumber === null}
//           disabled={isLoading}
//         >
//           <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
//         </Button>
//       </CardHeader>
//       <CardContent>
//         <div className='space-y-2'>
//           {tasks.map((task) => {
//             const taskProgress = weeklyProgress?.tasks?.find(
//               (t) => t.taskId === task.id
//             )
//             return (
//               <div key={task.id} className='flex items-center justify-between'>
//                 <span>{task.title}</span>
//                 <span>
//                   {taskProgress?.completedBy.length || 0}/
//                   {classroom?.students?.length || 0} completed
//                 </span>
//               </div>
//             )
//           })}
//         </div>
//       </CardContent>
//     </Card>
//   )
// }
