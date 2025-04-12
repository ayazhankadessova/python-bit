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
// import { use } from 'react'

interface PostPageProps {
  params: Promise<{
    slug: string[]
  }>
}

async function getPostFromParams(params: PostPageProps['params']) {
  const resolvedParams = await params
  const slug = resolvedParams?.slug?.join('/')
  const post = projects.find((post) => post.slugAsParams === slug)

  return post
}

export async function generateStaticParams(): Promise<
  { slug: string[]; revalidate?: number }[]
> {
  return projects.map((post) => ({
    slug: post.slugAsParams.split('/'),
    revalidate: 7200,
  }))
}

export default async function ProjectPage(props: PostPageProps) {
  const params = await props.params
  // const resolvedParams = await params
  const post = await getPostFromParams(props.params)
  const fullLinkGenerated = `${siteConfig.url}/projects/${post?.theme
    .trim()
    .replace('', '-')}/${params?.slug?.join('/')}`
  const exercise = getExerciseById(post?.slugAsParams)

  if (!post || !post.published) {
    notFound()
  }

  return (
    <div className='flex flex-col h-screen xl:px-12 lg:px-8 md:px-4 sm:px-4 pt-8 mb-16'>
      <div className='flex justify-between mb-4 ml-1'>
        <BackButton
          href={`/projects/${post?.theme.trim().replace(' ', '-')}/`}
        />{' '}
        <SharePost fullLink={fullLinkGenerated} />
      </div>

      {/* Split screen container */}
      <div className='flex flex-1 min-h-0'>
        {' '}
        {/* Left side - Tutorial content */}
        <div className='w-1/2 overflow-y-auto border-r pr-6'>
          <div className='max-w-3xl mx-auto'>
            <article className='prose prose-img:rounded-xl prose dark:prose-invert'>
              <h1 className='mb-2 text-foreground dark:text-foreground'>
                {post.title}
              </h1>
              <div className='my-4'>
                <ProjectStatus projectId={post.slugAsParams} detailed={true} />
              </div>
              {exercise?.description && (
                <p className='text-xl mt-0 text-muted-foreground dark:text-muted-foreground'>
                  {exercise?.description}
                </p>
              )}
              <hr className='my-4' />
              <MDXContent code={post.body} />
            </article>
          </div>
        </div>
        {/* Right side - Code editor */}
        <div className='w-1/2 overflow-hidden'>
          {' '}
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
