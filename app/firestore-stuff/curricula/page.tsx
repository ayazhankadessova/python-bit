'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { doc, setDoc, collection, getDocs } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import {Curriculum, Week } from '@/types/classrooms/live-session'

interface Problem {
  id: string
  title: string
  difficulty: string
}

const initialState: Curriculum = {
  name: '',
  description: '',
  weeks: [
    {
      weekNumber: 1,
      title: '',
      assignmentIds: [],
      tutorialContent: {
        theory: '',
        examples: '',
        resources: [],
      }
    },
  ],
}

const CurriculumForm = () => {
  const [inputs, setInputs] = useState<Curriculum>(initialState)
  const [loading, setLoading] = useState(false)
  const [problems, setProblems] = useState<Problem[]>([])

  const MultiSelect = ({
    selected,
    options,
    onChange,
  }: {
    selected: string[]
    options: Problem[]
    onChange: (values: string[]) => void
  }) => {
    const [open, setOpen] = useState(false)

    return (
      <div className='relative'>
        <Select
          open={open}
          onOpenChange={setOpen}
          value={selected[0]}
          onValueChange={(value) => {
            const newSelected = selected.includes(value)
              ? selected.filter((id) => id !== value)
              : [...selected, value]
            onChange(newSelected)
          }}
        >
          <SelectTrigger className='bg-gray-50 border-gray-300'>
            <SelectValue>
              {selected.length > 0
                ? `${selected.length} problem${
                    selected.length > 1 ? 's' : ''
                  } selected`
                : 'Select problems'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((problem) => (
              <SelectItem
                key={problem.id}
                value={problem.id}
                className='flex items-center space-x-2'
              >
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={selected.includes(problem.id)}
                    className='mr-2 h-4 w-4'
                    onChange={() => {
                      const newSelected = selected.includes(problem.id)
                        ? selected.filter((id) => id !== problem.id)
                        : [...selected, problem.id]
                      onChange(newSelected)
                    }}
                  />
                  <span>
                    {problem.title}{' '}
                    <span
                      className={`text-sm ${
                        problem.difficulty === 'Easy'
                          ? 'text-green-600'
                          : problem.difficulty === 'Medium'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      ({problem.difficulty})
                    </span>
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selected.length > 0 && (
          <div className='mt-2 flex flex-wrap gap-2'>
            {selected.map((id) => {
              const problem = options.find((p) => p.id === id)
              if (!problem) return null

              return (
                <div
                  key={id}
                  className='flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-sm'
                >
                  <span>{problem.title}</span>
                  <button
                    type='button'
                    onClick={() => {
                      onChange(
                        selected.filter((selectedId) => selectedId !== id)
                      )
                    }}
                    className='text-gray-500 hover:text-gray-700'
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Fetch available problems from Firestore
  useEffect(() => {
    const fetchProblems = async () => {
      const problemsSnapshot = await getDocs(collection(fireStore, 'problems'))
      const problemsList: Problem[] = []
      problemsSnapshot.forEach((doc) => {
        problemsList.push({
          id: doc.id,
          title: doc.data().title,
          difficulty: doc.data().difficulty,
        })
      })
      setProblems(problemsList)
    }

    fetchProblems()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleWeekChange = (index: number, field: keyof Week, value: string) => {
    setInputs((prev) => ({
      ...prev,
      weeks: prev.weeks.map((week, i) =>
        i === index ? { ...week, [field]: value } : week
      ),
    }))
  }

  const addWeek = () => {
    setInputs((prev) => ({
      ...prev,
      weeks: [
        ...prev.weeks,
        {
          weekNumber: prev.weeks.length + 1,
          title: '',
          assignmentIds: [],
          tutorialContent: {
            theory: '',
            examples: '',
            resources: [],
          },
        },
      ],
    }))
  }

  const removeWeek = (index: number) => {
    setInputs((prev) => ({
      ...prev,
      weeks: prev.weeks.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const curriculumId = inputs.name.replace(" ", "-")
      const curriculumDoc = {
        ...inputs,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await setDoc(doc(fireStore, 'curricula', curriculumId), curriculumDoc)
      alert('Curriculum saved successfully!')
      setInputs(initialState)
    } catch (error) {
      console.error('Error saving curriculum:', error)
      alert('Error saving curriculum. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center'>
      <div className='w-full max-w-2xl'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-bold text-gray-900'>
            Create Curriculum
          </h2>
          <p className='mt-2 text-gray-600'>Design a new learning path</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-200'
        >

          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              name='name'
              value={inputs.name}
              onChange={handleInputChange}
              placeholder='Python Basics'
              required
              className='bg-gray-50 border-gray-300'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              name='description'
              value={inputs.description}
              onChange={handleInputChange}
              placeholder='Course description...'
              required
              className='bg-gray-50 border-gray-300 min-h-[100px]'
            />
          </div>

          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <Label>Weeks</Label>
              <Button
                type='button'
                onClick={addWeek}
                variant='outline'
                size='sm'
              >
                <Plus className='h-4 w-4 mr-2' />
                Add Week
              </Button>
            </div>

            {inputs.weeks.map((week, index) => (
              <div key={index} className='p-4 border rounded-lg space-y-4'>
                <div className='flex justify-between items-center'>
                  <h3 className='font-medium'>Week {week.weekNumber}</h3>
                  <Button
                    type='button'
                    onClick={() => removeWeek(index)}
                    variant='ghost'
                    size='sm'
                    className='text-red-500 hover:text-red-700'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>

                <div className='space-y-4'>
                  <div>
                    <Label>Topic</Label>
                    <Input
                      value={week.title}
                      onChange={(e) =>
                        handleWeekChange(index, 'title', e.target.value)
                      }
                      placeholder="Week's topic"
                      required
                      className='bg-gray-50 border-gray-300'
                    />
                  </div>

                  <div>
                    <Label>Assignments</Label>
                    <MultiSelect
                      selected={week.assignmentIds}
                      options={problems}
                      onChange={(values) =>
                        // TODO
                        handleWeekChange(index, 'assignmentIds', values[0])
                      }
                    />
                    <p className='text-sm text-gray-500 mt-1'>
                      {week.assignmentIds.length} problem
                      {week.assignmentIds.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              'Create Curriculum'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default CurriculumForm
