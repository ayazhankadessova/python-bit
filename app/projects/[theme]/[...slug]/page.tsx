'use client'

import { projects } from '#site/content'
import { notFound } from 'next/navigation'
import { MDXContent } from '@/components/mdx-components'
import { SharePost } from '@/components/share-post'
import { siteConfig } from '@/config/site'
import BackButton from '@/components/ui/backbutton'
import PythonResizableCodeEditor from '@/components/code-resizable-executor'
import { getExerciseById } from '@/lib/projects/utils'
import { ProjectStatus } from '@/components/projects/project-status'
import '@/styles/mdx-style.css'
import { useState, useEffect } from 'react'

interface PostPageProps {
  params: {
    slug: string[]
  }
}

// Modified function to fetch post data based on params
async function getPostFromParams(params: PostPageProps['params']) {
  const slug = params?.slug?.join('/')
  const post = projects.find((post) => post.slugAsParams === slug)

  return post
}

// No need for generateStaticParams anymore, dynamic rendering on demand
export default function ProjectPage({ params }: PostPageProps) {
  const [post, setPost] = useState<any>(null)
  const [exercise, setExercise] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const fetchedPost = await getPostFromParams(params)

      if (!fetchedPost || !fetchedPost.published) {
        notFound()
      }

      setPost(fetchedPost)
      console.log(fetchedPost.body) // Log the post body content

      // Fetch exercise data after post data is loaded
      if (fetchedPost) {
        const fetchedExercise = getExerciseById(fetchedPost.id)
        setExercise(fetchedExercise)
      }
    }

    fetchData()
  }, [params]) // Depend on params to refetch when they change

  const handleNextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1)
  }

  if (!post) {
    return <div>Loading...</div> // Optional loading state
  }

  const fullLinkGenerated = `${siteConfig.url}/projects/${post?.theme.trim().replace("", '-')}/${params?.slug?.join('/')}`

  return (
    <div className='flex flex-col h-screen'>
      {/* Navigation bar */}
      <div className='flex-none px-4 py-4 border-b'>
        <div className='flex items-start justify-between'>
          <BackButton />
          <SharePost fullLink={fullLinkGenerated} />
        </div>
      </div>

      {/* Split screen container */}
      <div className='flex flex-1 min-h-0'>
        {/* Left side - Tutorial content */}
        <div className='w-1/2 overflow-y-auto border-r p-6'>
          <div className='max-w-3xl mx-auto'>
            <article className='prose prose-img:rounded-xl prose dark:prose-invert'>
              <h1 className='mb-2 text-foreground dark:text-foreground'>
                {post.title}
              </h1>
              <div className='my-4'>
                <ProjectStatus projectId={post.slugAsParams} detailed={true}/>
              </div>
              {post.description && (
                <p className='text-xl mt-0 text-muted-foreground dark:text-muted-foreground '>
                  {post.description}
                </p>
              )}
              <hr className='my-4' />
              {/* <div className={currentStep === 0 ? 'blur-sm' : ''}> */}
                <MDXContent code={post.body} />
              {/* </div> */}
            </article>
            {/* <button onClick={handleNextStep} className='mt-4 px-4 py-2 bg-blue-500 text-white rounded'>
              Next
            </button> */}
          </div>
        </div>
        {/* Right side - Code editor */}
        <div className={`w-1/2 overflow-hidden `}>
          {exercise && (
            <PythonResizableCodeEditor
              initialCode={exercise?.starterCode}
              project_id={exercise?.id}
              isProject={true}
            />
          )}
        </div>
      </div>
    </div>
  )
}
