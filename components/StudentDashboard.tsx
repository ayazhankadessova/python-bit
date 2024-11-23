// components/StudentDashboard.tsx
import { useRouter } from 'next/navigation'
import { Student } from '@/models/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BookOpen, Trophy, Users } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface StudentDashboardProps {
  user: Student
  onSignOut: () => void
}

export function StudentDashboard({ user, onSignOut }: StudentDashboardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [classroomCode, setClassroomCode] = useState('')
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [inviteLink, setInviteLink] = useState('')

  const handleJoinClassroom = async () => {
    if (!classroomCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a classroom code',
        variant: 'destructive',
      })
      return
    }

    setIsJoining(true)
    try {
      const url = `/classroom/${classroomCode}?username=${encodeURIComponent(
        user.username
      )}&role=student`
      router.push(url)

      // Clear inputs
      setClassroomCode('')
      setInviteLink('')
      setShowJoinDialog(false)
    } catch (error) {
      console.error('Error joining classroom:', error)
      toast({
        title: 'Error',
        description:
          'Failed to join classroom. Please check the code and try again.',
        variant: 'destructive',
      })
    } finally {
      setIsJoining(false)
    }
  }

  const handleInviteLinkJoin = () => {
    if (!inviteLink.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an invite link',
        variant: 'destructive',
      })
      return
    }

    // Extract classroom ID from invite link
    const match = inviteLink.match(/\/join\/([^\/]+)/)
    if (match) {
      setClassroomCode(match[1])
      handleJoinClassroom()
    } else {
      toast({
        title: 'Error',
        description: 'Invalid invite link format',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-8 flex justify-between items-center'>
        <div>
          <h1 className='text-4xl font-bold mb-2'>Welcome, {user.username}!</h1>
          <p className='text-gray-600'>Ready to learn Python?</p>
        </div>
        <Button variant='outline' onClick={onSignOut}>
          Sign Out
        </Button>
      </div>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BookOpen className='h-5 w-5' />
              My Classes
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              {user.classrooms?.length ? (
                user.classrooms.map((classroomId) => (
                  <Button
                    key={classroomId}
                    variant='outline'
                    className='w-full justify-start'
                    onClick={() => router.push(`/classroom/${classroomId}`)}
                  >
                    View Class
                  </Button>
                ))
              ) : (
                <p className='text-sm text-gray-500'>No enrolled classes yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Trophy className='h-5 w-5' />
              My Progress
            </CardTitle>
            <CardDescription>Track your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <p className='text-sm font-medium'>Grade Level</p>
                <p className='text-2xl font-bold'>{user.grade || 'Not set'}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Classes Completed</p>
                <p className='text-2xl font-bold'>0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              School Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <p className='text-sm font-medium'>School Name</p>
                <p className='text-2xl font-bold'>{user.school}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Enrolled Classes</p>
                <p className='text-2xl font-bold'>
                  {user.classrooms?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              Join Classroom
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <Input
                placeholder='Enter classroom code'
                value={classroomCode}
                onChange={(e) => setClassroomCode(e.target.value)}
              />
              <Button
                className='w-full'
                onClick={handleJoinClassroom}
                disabled={isJoining}
              >
                {isJoining ? 'Joining...' : 'Join Class'}
              </Button>
              <p className='text-sm text-muted-foreground text-center'>
                Or use an{' '}
                <button
                  onClick={() => setShowJoinDialog(true)}
                  className='text-primary hover:underline'
                >
                  invite link
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join via Invite Link</DialogTitle>
            <DialogDescription>
              Enter the invite link shared by your teacher
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <Input
              placeholder='Paste invite link here'
              value={inviteLink}
              onChange={(e) => setInviteLink(e.target.value)}
            />
            <Button
              className='w-full'
              onClick={handleInviteLinkJoin}
              disabled={isJoining}
            >
              {isJoining ? 'Joining...' : 'Join Classroom'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
