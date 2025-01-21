import { tutorials } from '#site/content'
import { notFound } from 'next/navigation'
import { MDXContent } from '@/components/mdx-components'
import { SharePost } from '@/components/share-post'
import { siteConfig } from '@/config/site'
import BackButton from '@/components/ui/backbutton'
import { TutorialStatus } from '@/components/tutorials/tutorial-status'
import '@/styles/mdx-style.css'
import ScrollProgress from '@/components/ui/scroll-progress'

interface PostPageProps {
  params: {
    slug: string[]
  }
}

async function getPostFromParams(params: PostPageProps['params']) {
  const slug = params?.slug?.join('/')
  const tutorial = tutorials.find((tutorial) => tutorial.slugAsParams === slug)

  return tutorial
}

// if slug is same as slugAsParams of one of the pages
export async function generateStaticParams(): Promise<
  { slug: string[]; revalidate?: number }[]
> {
  return tutorials.map((tutorial) => ({
    slug: tutorial.slugAsParams.split('/'),
    revalidate: 7200,
  }))
}

export default async function PostPage({ params }: PostPageProps) {
  const tutorial = await getPostFromParams(params)
  const fullLinkGenerated = `${siteConfig.url}/tutorials/${params?.slug?.join('/')}`

  if (!tutorial || !tutorial.published) {
    notFound()
  }

  return (
    <div className='container mx-auto px-6 py-8 max-w-5xl'>
      <ScrollProgress className='top-[81px]' />
      <div className='flex items-start justify-between mb-4'>
        <BackButton />
        <SharePost fullLink={fullLinkGenerated} />
      </div>
      <article className='prose prose-img:rounded-xl max-w-none mt-2 prose dark:prose-invert'>
        <h1 className='mb-2 text-foreground dark:text-foreground'>
          {tutorial.title}
        </h1>
        <TutorialStatus
          tutorialId={tutorial.firestoreId}
          exerciseCount={tutorial.exercises}
          detailed={true}
          className='my-6'
        />
        {tutorial.description ? (
          <p className='text-xl mt-0  text-muted-foreground dark:text-muted-foreground'>
            {tutorial.description}
          </p>
        ) : null}
        <hr className='my-4' />
        <MDXContent code={tutorial.body} />
      </article>
    </div>
  )
}
