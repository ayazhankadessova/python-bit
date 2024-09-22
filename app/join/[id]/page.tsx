'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/hooks/use-toast'

const JoinClassroomPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter()
  const { toast } = useToast()
  const [studentId, setStudentId] = useState('')
  const [username, setUsername] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  const handleJoinClassroom = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsJoining(true)
    try {
      // const response = await fetch(`/api/classroom/${params.id}/invite`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // })
      // if (!response.ok) {
      //   throw new Error('Failed to join classroom')
      // }
      router.push(
        `/classroom/${params.id}?role=student&id=${studentId}&username=${username}`
      )
    } catch (error) {
      console.error('Error joining classroom:', error)
      toast({
        title: 'Error',
        description: 'Failed to join classroom. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className='container mx-auto mt-10 max-w-md'>
      <h1 className='text-2xl font-bold mb-4'>Join Classroom</h1>
      <form onSubmit={handleJoinClassroom}>
        <Input
          type='text'
          placeholder='Enter your username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className='mb-4'
          required
        />
        <Button type='submit' disabled={isJoining}>
          {isJoining ? 'Joining...' : 'Join Classroom'}
        </Button>
      </form>
    </div>
  )
}

export default JoinClassroomPage
