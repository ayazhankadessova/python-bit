import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface ClassroomSearchProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  actionButton: React.ReactNode
}

export function ClassroomSearch({
  searchTerm,
  onSearchChange,
  actionButton,
}: ClassroomSearchProps) {
  return (
    <div className='flex justify-between mb-6'>
      <div className='relative w-64'>
        <Search className='absolute left-2 top-2.5 h-4 w-4 text-gray-500' />
        <Input
          type='text'
          placeholder='Search classrooms'
          className='pl-8'
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      {actionButton}
    </div>
  )
}
