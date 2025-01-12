"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash } from 'lucide-react'
import { doc, setDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import {Assignment, Curriculum} from '@/types/classrooms/live-session'

const CurriculumManager = () => {
  const [activeTab, setActiveTab] = useState('curriculum')
  const [curriculum, setCurriculum] = useState<Curriculum>({
    name: '',
    description: '',
    weeks: [],
  })

  const [assignment, setAssignment] = useState<Assignment>({
    id: '',
    title: '',
    problemStatement: '',
    starterCode: '',
    starterFunctionName: '',
    examples: [],
  })

  const handleCurriculumSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const curriculumId = crypto.randomUUID()
      await setDoc(doc(fireStore, 'curricula', curriculumId), curriculum)
      alert('Curriculum saved successfully!')
    } catch (error) {
      console.error('Error saving curriculum:', error)
      alert('Error saving curriculum')
    }
  }


  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await setDoc(doc(fireStore, 'assignments', assignment.id), assignment)
      alert('Assignment saved successfully!')
    } catch (error) {
      console.error('Error saving assignment:', error)
      alert('Error saving assignment')
    }
  }

  const addWeek = () => {
    setCurriculum((prev) => ({
      ...prev,
      weeks: [
        ...prev.weeks,
        {
          weekNumber: prev.weeks.length + 1,
          title: '',
          tutorialContent: {
            theory: '',
            examples: '',
            resources: [],
          },
          assignmentIds: [],
        },
      ],
    }))
  }

  const addExample = () => {
    setAssignment((prev) => ({
      ...prev,
      examples: [
        ...prev.examples,
        {
          id: Date.now().toString(),
          inputText: '',
          outputText: '',
          explanation: '',
        },
      ],
    }))
  }

  return (
    <div className='container mx-auto p-6 max-w-4xl'>
      <Tabs
        defaultValue='curriculum'
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className='grid w-full grid-cols-2 mb-8'>
          <TabsTrigger value='curriculum'>Curriculum</TabsTrigger>
          <TabsTrigger value='assignment'>Assignment</TabsTrigger>
        </TabsList>

        <TabsContent value='curriculum'>
          <Card>
            <CardHeader>
              <CardTitle>Create Curriculum</CardTitle>
            </CardHeader>
            <CardContent>

              <form onSubmit={handleCurriculumSubmit} className='space-y-6'>
                <div className='space-y-2'>
                  <Label>Title</Label>
                  <Input
                    value={curriculum.name}
                    onChange={(e) =>
                      setCurriculum((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder='Python for Beginners'
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Description</Label>
                  <Textarea
                    value={curriculum.description}
                    onChange={(e) =>
                      setCurriculum((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder='Course description...'
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
                      <Plus className='w-4 h-4 mr-2' />
                      Add Week
                    </Button>
                  </div>

                  {curriculum.weeks.map((week, index) => (
                    <Card key={index} className='p-4'>
                      <div className='space-y-4'>
                        <div className='flex justify-between items-center'>
                          <h3 className='font-medium'>
                            Week {week.weekNumber}
                          </h3>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setCurriculum((prev) => ({
                                ...prev,
                                weeks: prev.weeks.filter((_, i) => i !== index),
                              }))
                            }}
                          >
                            <Trash className='w-4 h-4' />
                          </Button>
                        </div>

                        <div className='space-y-4'>
                          <div>
                            <Label>Week Title</Label>
                            <Input
                              value={week.title}
                              onChange={(e) => {
                                setCurriculum((prev) => ({
                                  ...prev,
                                  weeks: prev.weeks.map((w, i) =>
                                    i === index
                                      ? { ...w, title: e.target.value }
                                      : w
                                  ),
                                }))
                              }}
                              placeholder='Week title'
                            />
                          </div>

                          <div className='space-y-2'>
                            <Label>Theory Content</Label>
                            <Textarea
                              value={week.tutorialContent.theory}
                              onChange={(e) => {
                                setCurriculum((prev) => ({
                                  ...prev,
                                  weeks: prev.weeks.map((w, i) =>
                                    i === index
                                      ? {
                                          ...w,
                                          tutorialContent: {
                                            ...w.tutorialContent,
                                            theory: e.target.value,
                                          },
                                        }
                                      : w
                                  ),
                                }))
                              }}
                              placeholder='Theory content (markdown)'
                              className='min-h-[100px]'
                            />
                          </div>

                          <div className='space-y-2'>
                            <Label>Code Examples</Label>
                            <Textarea
                              value={week.tutorialContent.examples}
                              onChange={(e) => {
                                setCurriculum((prev) => ({
                                  ...prev,
                                  weeks: prev.weeks.map((w, i) =>
                                    i === index
                                      ? {
                                          ...w,
                                          tutorialContent: {
                                            ...w.tutorialContent,
                                            examples: e.target.value,
                                          },
                                        }
                                      : w
                                  ),
                                }))
                              }}
                              placeholder='Code examples'
                              className='font-mono min-h-[100px]'
                            />
                          </div>

                          <div className='space-y-2'>
                            <Label>Resources</Label>
                            <div className='flex gap-2'>
                              <Input
                                placeholder='Add resource URL'
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    const input = e.target as HTMLInputElement
                                    if (input.value.trim()) {
                                      setCurriculum((prev) => ({
                                        ...prev,
                                        weeks: prev.weeks.map((w, i) =>
                                          i === index
                                            ? {
                                                ...w,
                                                tutorialContent: {
                                                  ...w.tutorialContent,
                                                  resources: [
                                                    ...w.tutorialContent
                                                      .resources,
                                                    input.value.trim(),
                                                  ],
                                                },
                                              }
                                            : w
                                        ),
                                      }))
                                      input.value = ''
                                    }
                                  }
                                }}
                              />
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                className='shrink-0'
                                onClick={(e) => {
                                  const input = e.currentTarget
                                    .previousElementSibling as HTMLInputElement
                                  if (input.value.trim()) {
                                    setCurriculum((prev) => ({
                                      ...prev,
                                      weeks: prev.weeks.map((w, i) =>
                                        i === index
                                          ? {
                                              ...w,
                                              tutorialContent: {
                                                ...w.tutorialContent,
                                                resources: [
                                                  ...w.tutorialContent
                                                    .resources,
                                                  input.value.trim(),
                                                ],
                                              },
                                            }
                                          : w
                                      ),
                                    }))
                                    input.value = ''
                                  }
                                }}
                              >
                                Add
                              </Button>
                            </div>
                            <div className='flex flex-wrap gap-2 mt-2'>
                              {week.tutorialContent.resources.map(
                                (resource, resourceIndex) => (
                                  <div
                                    key={resourceIndex}
                                    className='flex items-center gap-1 bg-secondary rounded-full px-3 py-1'
                                  >
                                    <span className='text-sm truncate max-w-[200px]'>
                                      {resource}
                                    </span>
                                    <Button
                                      type='button'
                                      variant='ghost'
                                      size='sm'
                                      className='h-4 w-4 p-0 hover:bg-transparent'
                                      onClick={() => {
                                        setCurriculum((prev) => ({
                                          ...prev,
                                          weeks: prev.weeks.map((w, i) =>
                                            i === index
                                              ? {
                                                  ...w,
                                                  tutorialContent: {
                                                    ...w.tutorialContent,
                                                    resources:
                                                      w.tutorialContent.resources.filter(
                                                        (_, ri) =>
                                                          ri !== resourceIndex
                                                      ),
                                                  },
                                                }
                                              : w
                                          ),
                                        }))
                                      }}
                                    >
                                      ×
                                    </Button>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          <div className='space-y-2'>
                            <Label>Assignments</Label>
                            <div className='flex gap-2'>
                              <Input
                                placeholder='Assignment ID'
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    const input = e.target as HTMLInputElement
                                    if (
                                      input.value.trim() &&
                                      !week.assignmentIds.includes(
                                        input.value.trim()
                                      )
                                    ) {
                                      setCurriculum((prev) => ({
                                        ...prev,
                                        weeks: prev.weeks.map((w, i) =>
                                          i === index
                                            ? {
                                                ...w,
                                                assignmentIds: [
                                                  ...w.assignmentIds,
                                                  input.value.trim(),
                                                ],
                                              }
                                            : w
                                        ),
                                      }))
                                      input.value = ''
                                    }
                                  }
                                }}
                              />
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                className='shrink-0'
                                onClick={(e) => {
                                  const input = e.currentTarget
                                    .previousElementSibling as HTMLInputElement
                                  if (
                                    input.value.trim() &&
                                    !week.assignmentIds.includes(
                                      input.value.trim()
                                    )
                                  ) {
                                    setCurriculum((prev) => ({
                                      ...prev,
                                      weeks: prev.weeks.map((w, i) =>
                                        i === index
                                          ? {
                                              ...w,
                                              assignmentIds: [
                                                ...w.assignmentIds,
                                                input.value.trim(),
                                              ],
                                            }
                                          : w
                                      ),
                                    }))
                                    input.value = ''
                                  }
                                }}
                              >
                                Add
                              </Button>
                            </div>
                            <div className='flex flex-wrap gap-2 mt-2'>
                              {week.assignmentIds.map(
                                (assignmentId, assignmentIndex) => (
                                  <div
                                    key={assignmentIndex}
                                    className='flex items-center gap-1 bg-primary/10 rounded-full px-3 py-1'
                                  >
                                    <span className='text-sm'>
                                      {assignmentId}
                                    </span>
                                    <Button
                                      type='button'
                                      variant='ghost'
                                      size='sm'
                                      className='h-4 w-4 p-0 hover:bg-transparent'
                                      onClick={() => {
                                        setCurriculum((prev) => ({
                                          ...prev,
                                          weeks: prev.weeks.map((w, i) =>
                                            i === index
                                              ? {
                                                  ...w,
                                                  assignmentIds:
                                                    w.assignmentIds.filter(
                                                      (_, ai) =>
                                                        ai !== assignmentIndex
                                                    ),
                                                }
                                              : w
                                          ),
                                        }))
                                      }}
                                    >
                                      ×
                                    </Button>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button type='submit' className='w-full'>
                  Save Curriculum
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='assignment'>
          <Card>
            <CardHeader>
              <CardTitle>Create Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAssignmentSubmit} className='space-y-6'>
                <div className='space-y-2'>
                  <Label>Assignment ID</Label>
                  <Input
                    value={assignment.id}
                    onChange={(e) =>
                      setAssignment((prev) => ({ ...prev, id: e.target.value }))
                    }
                    placeholder='unique-assignment-id'
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Title</Label>
                  <Input
                    value={assignment.title}
                    onChange={(e) =>
                      setAssignment((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder='Create Your First Greeting Program'
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Problem Statement (Markdown)</Label>
                  <Textarea
                    value={assignment.problemStatement}
                    onChange={(e) =>
                      setAssignment((prev) => ({
                        ...prev,
                        problemStatement: e.target.value,
                      }))
                    }
                    placeholder='# Problem Description...'
                    className='min-h-[200px]'
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Starter Code</Label>
                  <Textarea
                    value={assignment.starterCode}
                    onChange={(e) =>
                      setAssignment((prev) => ({
                        ...prev,
                        starterCode: e.target.value,
                      }))
                    }
                    placeholder='def solution():'
                    className='font-mono'
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Starter Function Name</Label>
                  <Input
                    value={assignment.starterFunctionName}
                    onChange={(e) =>
                      setAssignment((prev) => ({
                        ...prev,
                        starterFunctionName: e.target.value,
                      }))
                    }
                    placeholder='solution'
                  />
                </div>

                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <Label>Examples</Label>
                    <Button
                      type='button'
                      onClick={addExample}
                      variant='outline'
                      size='sm'
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Add Example
                    </Button>
                  </div>

                  {assignment.examples.map((example, index) => (
                    <Card key={example.id} className='p-4'>
                      <div className='space-y-4'>
                        <div className='flex justify-between items-center'>
                          <h3 className='font-medium'>Example {index + 1}</h3>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setAssignment((prev) => ({
                                ...prev,
                                examples: prev.examples.filter(
                                  (e) => e.id !== example.id
                                ),
                              }))
                            }}
                          >
                            <Trash className='w-4 h-4' />
                          </Button>
                        </div>

                        <Input
                          value={example.inputText}
                          onChange={(e) => {
                            setAssignment((prev) => ({
                              ...prev,
                              examples: prev.examples.map((ex) =>
                                ex.id === example.id
                                  ? { ...ex, inputText: e.target.value }
                                  : ex
                              ),
                            }))
                          }}
                          placeholder='Input'
                        />

                        <Input
                          value={example.outputText}
                          onChange={(e) => {
                            setAssignment((prev) => ({
                              ...prev,
                              examples: prev.examples.map((ex) =>
                                ex.id === example.id
                                  ? { ...ex, outputText: e.target.value }
                                  : ex
                              ),
                            }))
                          }}
                          placeholder='Expected output'
                        />

                        <Input
                          value={example.explanation || ''}
                          onChange={(e) => {
                            setAssignment((prev) => ({
                              ...prev,
                              examples: prev.examples.map((ex) =>
                                ex.id === example.id
                                  ? { ...ex, explanation: e.target.value }
                                  : ex
                              ),
                            }))
                          }}
                          placeholder='Explanation (optional)'
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                <Button type='submit' className='w-full'>
                  Save Assignment
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CurriculumManager
