'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash } from 'lucide-react'
import { doc, setDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import {Quiz, Question} from "@/types/quiz/quiz"

const QuizManager = () => {
  const [quiz, setQuiz] = useState<Quiz>({
    id: '',
    title: '',
    description: '',
    tutorialId: '',
    questions: [],
  })

  const addQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: `q${prev.questions.length + 1}`,
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: '',
          imageUrl: '',
        },
      ],
    }))
  }

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!quiz.id) {
        alert('Please provide a quiz ID')
        return
      }

      // Validate questions
      const isValid = quiz.questions.every(
        (q) =>
          q.question &&
          q.options.every((opt) => opt.trim() !== '') &&
          q.explanation.trim() !== ''
      )

      if (!isValid) {
        alert('Please fill out all question fields')
        return
      }

      await setDoc(doc(fireStore, 'problems', quiz.id), quiz)
      alert('Quiz saved successfully!')
    } catch (error) {
      console.error('Error saving quiz:', error)
      alert('Error saving quiz')
    }
  }

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, ...updates } : q
      ),
    }))
  }

  const removeQuestion = (index: number) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className='container mx-auto p-6 max-w-4xl'>
      <Card>
        <CardHeader>
          <CardTitle>Create Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleQuizSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label>Quiz ID</Label>
              <Input
                value={quiz.id}
                onChange={(e) =>
                  setQuiz((prev) => ({ ...prev, id: e.target.value }))
                }
                placeholder='python101-1-what-is-python-quiz'
              />
            </div>

            <div className='space-y-2'>
              <Label>Title</Label>
              <Input
                value={quiz.title}
                onChange={(e) =>
                  setQuiz((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder='Hello World Quiz'
              />
            </div>

            <div className='space-y-2'>
              <Label>Description</Label>
              <Textarea
                value={quiz.description}
                onChange={(e) =>
                  setQuiz((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder='Test your knowledge of Python basics from the Hello World tutorial!'
              />
            </div>

            <div className='space-y-2'>
              <Label>Tutorial ID (Optional)</Label>
              <Input
                value={quiz.tutorialId}
                onChange={(e) =>
                  setQuiz((prev) => ({ ...prev, tutorialId: e.target.value }))
                }
                placeholder='python101-1-what-is-python'
              />
            </div>

            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <Label>Questions</Label>
                <Button
                  type='button'
                  onClick={addQuestion}
                  variant='outline'
                  size='sm'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Add Question
                </Button>
              </div>

              {quiz.questions.map((question, questionIndex) => (
                <Card key={question.id} className='p-4'>
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <h3 className='font-medium'>
                        Question {questionIndex + 1}
                      </h3>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => removeQuestion(questionIndex)}
                      >
                        <Trash className='w-4 h-4' />
                      </Button>
                    </div>

                    <div className='space-y-2'>
                      <Label>Question Text</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) =>
                          updateQuestion(questionIndex, {
                            question: e.target.value,
                          })
                        }
                        placeholder='What is the correct way to print in Python?'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label>Options</Label>
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className='flex items-center space-x-2'
                        >
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...question.options]
                              newOptions[optionIndex] = e.target.value
                              updateQuestion(questionIndex, {
                                options: newOptions,
                              })
                            }}
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          <input
                            type='radio'
                            checked={question.correctAnswer === optionIndex}
                            onChange={() =>
                              updateQuestion(questionIndex, {
                                correctAnswer: optionIndex,
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className='space-y-2'>
                      <Label>Explanation</Label>
                      <Textarea
                        value={question.explanation}
                        onChange={(e) =>
                          updateQuestion(questionIndex, {
                            explanation: e.target.value,
                          })
                        }
                        placeholder='Explain why this is the correct answer'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label>Image URL (Optional)</Label>
                      <Input
                        value={question.imageUrl || ''}
                        onChange={(e) =>
                          updateQuestion(questionIndex, {
                            imageUrl: e.target.value,
                          })
                        }
                        placeholder='/quizzes/python101-1-what-is-python/q1.jpg'
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button type='submit' className='w-full'>
              Save Quiz
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default QuizManager
