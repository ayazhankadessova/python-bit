import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { User } from '@/types/firebase'

interface UserStatsProps {
  user: User
}

export const UserStats: React.FC<UserStatsProps> = ({ user }) => (
  <div className='grid grid-cols-2 gap-4 mt-4'>
    <Card>
      <CardContent className='p-4'>
        <div className='text-sm text-muted-foreground'>Solved Problems</div>
        <div className='text-2xl font-bold'>
          {user.solvedProblems?.length || 0}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className='p-4'>
        <div className='text-sm text-muted-foreground'>Liked Problems</div>
        <div className='text-2xl font-bold'>
          {user.likedProblems?.length || 0}
        </div>
      </CardContent>
    </Card>
  </div>
)
