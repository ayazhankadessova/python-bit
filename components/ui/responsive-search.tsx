import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function ResponsiveSearch() {
  return (
    <>
      {/* Desktop full search input */}
      <Input
        type='search'
        placeholder='Search'
        className='hidden xl:flex w-[200px] 2xl:w-[300px]'
      />

      {/* Icon with popover for medium screens */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='hidden min-[950px]:flex xl:hidden'
          >
            <Search className='h-5 w-5' />
            <span className='sr-only'>Search</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[200px] p-0'>
          <Input
            type='search'
            placeholder='Search'
            className='border-0 focus-visible:ring-0'
          />
        </PopoverContent>
      </Popover>

      {/* Mobile search */}
      <Input
        type='search'
        placeholder='Search'
        className='min-[950px]:hidden w-[140px] sm:w-[200px]'
      />
    </>
  )
}
