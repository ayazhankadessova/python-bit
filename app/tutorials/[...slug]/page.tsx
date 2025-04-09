import { tutorials } from '#site/content'
import { notFound } from 'next/navigation'
import { siteConfig } from '@/config/site'
import TutorialPageContent from '@/components/tutorials/tutorial-page-content'
import '@/styles/mdx-style.css'

interface PostPageProps {
  params: Promise<{
    slug: string[]
  }>
}

async function getPostFromParams(params: PostPageProps['params']) {
  const slug = (await params)?.slug?.join('/')
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

export default async function PostPage(props: PostPageProps) {
  const params = await props.params;
  const tutorial = await getPostFromParams(props.params)
  const fullLinkGenerated = `${siteConfig.url}/tutorials/${params?.slug?.join(
    '/'
  )}`

  if (!tutorial || !tutorial.published) {
    notFound()
  }

  const quizSlug = `${tutorial.slugAsParams}-quiz`

  return (
    <TutorialPageContent
      tutorial={tutorial}
      fullLinkGenerated={fullLinkGenerated}
      quizSlug={quizSlug}
    />
  )
}
