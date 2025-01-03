import { projects } from '#site/content'
import { notFound } from 'next/navigation'
import { MDXContent } from '@/components/mdx-components'
import { SharePost } from '@/components/share-post'
import { siteConfig } from '@/config/site'
import BackButton from '@/components/ui/backbutton'
import PythonResizableCodeEditor from '@/components/code-resizable-executor'
import { getExerciseById } from '@/utils/exercise'

interface PostPageProps {
  params: {
    slug: string[]
  }
}

async function getPostFromParams(params: PostPageProps['params']) {
  const slug = params?.slug?.join('/')
  const post = projects.find((post) => post.slugAsParams === slug)

  return post
}

// if slug is same as slugAsParams of one of the pages
export async function generateStaticParams(): Promise<
  { slug: string[]; revalidate?: number }[]
> {
  return projects.map((post) => ({
    slug: post.slugAsParams.split('/'),
    revalidate: 7200,
  }))
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostFromParams(params)
  const fullLinkGenerated = `${siteConfig.url}/blog/${params?.slug?.join('/')}`
  const exercise = getExerciseById(post!.id)


  if (!post || !post.published) {
    notFound()
  }

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
        {' '}
        {/* min-h-0 is crucial for flexbox height calculations */}
        {/* Left side - Tutorial content */}
        <div className='w-1/2 overflow-y-auto border-r p-6'>
          <div className='max-w-3xl mx-auto'>
            <article className='prose prose-img:rounded-xl prose dark:prose-invert'>
              <h1 className='mb-2 text-foreground dark:text-foreground'>
                {post.title}
              </h1>
              {post.description && (
                <p className='text-xl mt-0 text-muted-foreground dark:text-muted-foreground'>
                  {post.description}
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
              project_id = {exercise?.id}
              // testCode={exercise?.testCode}
              isProject={true}
            />
          )}
        </div>
      </div>
    </div>
  )
}