import { posts } from '#site/content'
import { notFound } from 'next/navigation'
import { MDXContent } from '@/components/mdx-components'
import { SharePost } from '@/components/share-post'
import { siteConfig } from '@/config/site'
import BackButton from '@/components/ui/backbutton'
import '@/styles/mdx-style.css'

interface PostPageProps {
  params: {
    slug: string[]
  }
}

async function getPostFromParams(params: PostPageProps['params']) {
  const slug = params?.slug?.join('/')
  const post = posts.find((post) => post.slugAsParams === slug)

  return post
}

// if slug is same as slugAsParams of one of the pages
export async function generateStaticParams(): Promise<
  { slug: string[]; revalidate?: number }[]
> {
  return posts.map((post) => ({
    slug: post.slugAsParams.split('/'),
    revalidate: 7200,
  }))
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostFromParams(params)
  const fullLinkGenerated = `${siteConfig.url}/blog/${params?.slug?.join('/')}`

  if (!post || !post.published) {
    notFound()
  }

  return (
    <div className='container mx-auto px-6 py-8 max-w-5xl'>
      <div className='flex items-start justify-between mb-4'>
        <BackButton />
        <SharePost fullLink={fullLinkGenerated} />
      </div>
      <article className='prose prose-img:rounded-xl max-w-none mt-2 prose dark:prose-invert'>
        <h1 className='mb-2 text-foreground dark:text-foreground'>
          {post.title}
        </h1>
        {post.description ? (
          <p className='text-xl mt-0  text-muted-foreground dark:text-muted-foreground'>
            {post.description}
          </p>
        ) : null}
        <hr className='my-4' />
        <MDXContent code={post.body} />
      </article>
    </div>
  )
}
