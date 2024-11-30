interface EmptyClassroomsProps {
  userRole: 'teacher' | 'student'
}

export function EmptyClassrooms({ userRole }: EmptyClassroomsProps) {
  return (
    <div className='text-center py-10'>
      <p className='text-gray-500'>
        {userRole === 'teacher'
          ? 'No classrooms found. Create your first classroom to get started!'
          : 'No classrooms found. Join a classroom to get started!'}
      </p>
    </div>
  )
}
