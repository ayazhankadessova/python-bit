import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Settings, BookOpen, Code } from 'lucide-react'
import {
  // Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useRouter } from 'next/navigation'
import { filterProjectsBySearchTerm } from '@/lib/projects/utils'
import { filterTutorialsBySearchTerm } from '@/lib/tutorials/utils'
import { projects, tutorials } from '#site/content'

export function ResponsiveSearch() {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  // Get two most recent projects and tutorials
  const recentProjects = [...projects]
    .sort((a, b) => b.date - a.date)
    .slice(0, 2)

  const recentTutorials = [...tutorials]
    .sort((a, b) => b.date - a.date)
    .slice(0, 2)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prevOpen) => !prevOpen)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSearch = useCallback((term: string) => {
    console.log('Search term:', term) // Log the search term
    setSearchTerm(term || '')
  }, [])

  const filteredProjects = filterProjectsBySearchTerm(projects, searchTerm)

  const filteredTutorials = filterTutorialsBySearchTerm(tutorials, searchTerm)

  const handleSelect = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  // Right before the return statement
  // console.log('Search term present:', !!searchTerm)
  // console.log('Tutorials to display:', filteredTutorials)

  return (
    <div>
      <Button
        variant='slate'
        className='relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2'
        onClick={() => setOpen(true)}
      >
        <Search className='h-4 w-4 xl:mr-2' />
        <span className='hidden xl:inline-flex'>Search content...</span>
        <kbd className='pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 xl:flex'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen} // Add these classes to override the background
      >
        <CommandInput
          placeholder='Search projects, tutorials, or type a command...'
          onValueChange={handleSearch}
          value={searchTerm}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {!searchTerm && (
            <>
              <CommandGroup heading='Recent Projects'>
                {recentProjects.map((project) => (
                  <CommandItem
                    key={project.slugAsParams}
                    onSelect={() =>
                      handleSelect(
                        `/projects/${project.theme}/${project.slugAsParams}`
                      )
                    }
                  >
                    <div className='flex items-center gap-2'>
                      <Code className='h-4 w-4' />
                      <div>
                        <p>{project.title}</p>
                        <p className='text-sm text-muted-foreground'>
                          {project.description}
                        </p>
                      </div>
                    </div>
                  </CommandItem>
                ))}
                <CommandItem
                  onSelect={() => handleSelect('/projects')}
                  className='font-medium text-sm text-muted-foreground hover:text-foreground'
                >
                  View all projects →
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading='Recent Tutorials'>
                {recentTutorials.map((tutorial) => (
                  <CommandItem
                    key={tutorial.title}
                    onSelect={() =>
                      handleSelect(`/tutorials/${tutorial.slugAsParams}`)
                    }
                  >
                    <div className='flex items-center gap-2'>
                      <BookOpen className='h-4 w-4' />
                      <div>
                        <p>{tutorial.title}</p>
                        <p className='text-sm text-muted-foreground'>
                          {tutorial.description}
                        </p>
                      </div>
                    </div>
                  </CommandItem>
                ))}
                <CommandItem
                  onSelect={() => handleSelect('/tutorials')}
                  className='font-medium text-sm text-muted-foreground hover:text-foreground'
                >
                  View all tutorials →
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading='Quick Links'>
                <CommandItem onSelect={() => handleSelect('/dashboard')}>
                  <div className='flex items-center gap-2'>
                    <Settings className='h-4 w-4' />
                    <span>Dashboard</span>
                  </div>
                </CommandItem>

                <CommandItem onSelect={() => handleSelect('/classrooms')}>
                  <div className='flex items-center gap-2'>
                    <BookOpen className='h-4 w-4' />
                    <span>Classrooms</span>
                  </div>
                </CommandItem>

                <CommandItem onSelect={() => handleSelect('/teaching-content')}>
                  <div className='flex items-center gap-2'>
                    <Code className='h-4 w-4' />
                    <span>Materials</span>
                  </div>
                </CommandItem>
              </CommandGroup>
            </>
          )}

          {searchTerm && (
            <>
              {/* Add debug info */}
              {console.log('Rendering filtered content')}
              {console.log('Number of tutorials:', filteredTutorials.length)}

              {/* Projects section remains the same */}

              {/* Modified Tutorials section */}
              {filteredTutorials?.length > 0 && (
                <>
                  {' '}
                  <CommandGroup heading='Tutorials'>
                    {filteredTutorials.map((tutorial) => {
                      console.log('Rendering tutorial:', tutorial.title)
                      return (
                        <CommandItem
                          key={tutorial.slug} // Changed from tutorial.title to tutorial.slug for uniqueness
                          onSelect={() =>
                            handleSelect(`/tutorials/${tutorial.slugAsParams}`)
                          }
                        >
                          <div className='flex items-center gap-2'>
                            <BookOpen className='h-4 w-4' />
                            <div>
                              <p>{tutorial.title}</p>
                              <p className='text-sm text-muted-foreground'>
                                {tutorial.description}
                              </p>
                            </div>
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {filteredProjects.length > 0 && (
                <CommandGroup heading='Projects'>
                  {filteredProjects.map((project) => (
                    <CommandItem
                      key={project.slugAsParams}
                      onSelect={() =>
                        handleSelect(
                          `/projects/${project.theme}/${project.slugAsParams}`
                        )
                      }
                    >
                      <div className='flex items-center gap-2'>
                        <Code className='h-4 w-4' />
                        <div>
                          <p>{project.title}</p>
                          <p className='text-sm text-muted-foreground'>
                            {project.description}
                          </p>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  )
}
