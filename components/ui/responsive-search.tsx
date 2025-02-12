import React, { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useRouter } from 'next/navigation'

// Types for our searchable content
type SearchableItem = {
  id: string
  title: string
  type: 'classroom' | 'tutorial' | 'guide'
  description?: string
  url: string
}

export function ResponsiveSearch() {
  const [open, setOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchableItem[]>([])
  const router = useRouter()

  // Mock data - replace with your actual data fetching logic
  const searchableContent: SearchableItem[] = [
    {
      id: '1',
      title: 'Introduction to Py',
      type: 'tutorial',
      description: 'Learn the basics of Python programming',
      url: '/tutorials',
    },
    {
      id: '3',
      title: 'Introduction to Java',
      type: 'tutorial',
      description: 'Learn the basics of Python programming',
      url: '/tutorials',
    },
    {
      id: '2',
      title: 'Virtual Classroom',
      type: 'classroom',
      description: 'Join interactive coding sessions',
      url: '/classroom',
    },
    // Add more items as needed
  ]

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSearch = useCallback((term: string) => {
    if (!term) {
      setSearchResults([])
      return
    }

    const results = searchableContent.filter(
      (item) =>
        item.title.toLowerCase().includes(term.toLowerCase()) ||
        item.description?.toLowerCase().includes(term.toLowerCase())
    )
    setSearchResults(results)
  }, [])

  const handleSelect = (item: SearchableItem) => {
    setOpen(false)
    router.push(item.url)
  }

  return (
    <>
      <Button
        variant='outline'
        className='relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2'
        onClick={() => setOpen(true)}
      >
        <Search className='h-4 w-4 xl:mr-2' />
        <span className='hidden xl:inline-flex'>Search...</span>
        <kbd className='pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 xl:flex'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder='Type to search...'
          onValueChange={handleSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchResults.map((group) => (
            <CommandGroup key={group.type} heading={group.type}>
              <CommandItem key={group.id} onSelect={() => handleSelect(group)}>
                <div className='flex flex-col'>
                  <span>{group.title}</span>
                  {group.description && (
                    <span className='text-sm text-muted-foreground'>
                      {group.description}
                    </span>
                  )}
                </div>
              </CommandItem>
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
