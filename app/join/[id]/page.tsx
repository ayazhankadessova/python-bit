// pages/join/[id].tsx
'use client'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/hooks/use-toast'

const JoinClassroomPage: React.FC = () => {
  const router = useRouter()
  const { id } = router.query
  const { toast } = useToast()
  const [studentName, setStudentName] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  const handleJoinClassroom = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsJoining(true)

    try {
      const response = await fetch(`/api/classroom/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentName }),
      })

      if (!response.ok) {
        throw new Error('Failed to join classroom')
      }

      const { sessionId } = await response.json()
      router.push(`/classroom/${id}?session=${sessionId}`)
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
    <div className='container mx-auto p-4 max-w-md'>
      <h1 className='text-2xl font-bold mb-4'>Join Classroom</h1>
      <form onSubmit={handleJoinClassroom}>
        <Input
          type='text'
          placeholder='Enter your name'
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className='mb-4'
          required
        />
        <Button type='submit' disabled={isJoining} className='w-full'>
          {isJoining ? 'Joining...' : 'Join Classroom'}
        </Button>
      </form>
    </div>
  )
}

export default JoinClassroomPage
