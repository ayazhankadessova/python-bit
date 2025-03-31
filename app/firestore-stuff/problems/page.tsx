'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { doc, setDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { Loader2 } from 'lucide-react'

interface ProblemInputs {
  id: string
  title: string
  difficulty: string
  category: string
  order: string
  videoId?: string
  link?: string
}

interface ProblemDocument extends Omit<ProblemInputs, 'order'> {
  order: number
  likes: number
  dislikes: number
}

const initialState: ProblemInputs = {
  id: '',
  title: '',
  difficulty: '',
  category: '',
  order: '',
  videoId: '',
  link: '',
}

const ProblemForm = () => {
  const [inputs, setInputs] = useState<ProblemInputs>(initialState)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleDifficultyChange = (value: string) => {
    setInputs((prev) => ({
      ...prev,
      difficulty: value,
    }))
  }

  const handleCategoryChange = (value: string) => {
    setInputs((prev) => ({
      ...prev,
      category: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const problemDoc: ProblemDocument = {
        ...inputs,
        order: Number(inputs.order),
        videoId: inputs.videoId || '',
        link: inputs.link || '',
        likes: 0,
        dislikes: 0,
      }

      await setDoc(doc(fireStore, 'problems', inputs.id), problemDoc)
      alert('Problem saved successfully!')
      setInputs(initialState)
    } catch (error) {
      console.error('Error saving problem:', error)
      alert('Error saving problem. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center'>
      <div className='w-full max-w-xl'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-bold text-gray-900'>Add New Problem</h2>
          <p className='mt-2 text-gray-600'>
            Fill in the details below to add a new problem to the database.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-200'
        >
          <div className='space-y-2'>
            <Label htmlFor='id' className='text-gray-700'>
              Problem ID
            </Label>
            <Input
              id='id'
              name='id'
              value={inputs.id}
              onChange={handleInputChange}
              placeholder='unique-problem-id'
              required
              className='bg-gray-50 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
            />
            <p className='text-sm text-gray-500'>
              This will be used as a unique identifier for the problem
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='title' className='text-gray-700'>
              Title
            </Label>
            <Input
              id='title'
              name='title'
              value={inputs.title}
              onChange={handleInputChange}
              placeholder='Problem Title'
              required
              className='bg-gray-50 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='difficulty' className='text-gray-700'>
              Difficulty
            </Label>
            <Select
              value={inputs.difficulty}
              onValueChange={handleDifficultyChange}
              required
            >
              <SelectTrigger className='bg-gray-50 border-gray-300'>
                <SelectValue placeholder='Select difficulty' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Easy'>Easy</SelectItem>
                <SelectItem value='Medium'>Medium</SelectItem>
                <SelectItem value='Hard'>Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='category' className='text-gray-700'>
              Category
            </Label>
            <Select
              value={inputs.category}
              onValueChange={handleCategoryChange}
              required
            >
              <SelectTrigger className='bg-gray-50 border-gray-300'>
                <SelectValue placeholder='Select category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Arrays'>Arrays</SelectItem>
                <SelectItem value='Strings'>Strings</SelectItem>
                <SelectItem value='Linked Lists'>Linked Lists</SelectItem>
                <SelectItem value='Trees'>Trees</SelectItem>
                <SelectItem value='Dynamic Programming'>
                  Dynamic Programming
                </SelectItem>
                <SelectItem value='Graphs'>Graphs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='order' className='text-gray-700'>
              Order
            </Label>
            <Input
              id='order'
              name='order'
              type='number'
              value={inputs.order}
              onChange={handleInputChange}
              placeholder='1'
              min='1'
              required
              className='bg-gray-50 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='videoId' className='text-gray-700'>
              Video ID (Optional)
            </Label>
            <Input
              id='videoId'
              name='videoId'
              value={inputs.videoId}
              onChange={handleInputChange}
              placeholder='YouTube Video ID'
              className='bg-gray-50 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='link' className='text-gray-700'>
              External Link (Optional)
            </Label>
            <Input
              id='link'
              name='link'
              value={inputs.link}
              onChange={handleInputChange}
              placeholder='https://example.com/problem'
              className='bg-gray-50 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
            />
          </div>

          <Button
            type='submit'
            className='w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors'
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              'Save Problem'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ProblemForm
