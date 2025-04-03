'use client'

import { motion } from 'framer-motion'
import { MDXContent } from '@/components/mdx-components'
import { SharePost } from '@/components/share-post'
import BackButton from '@/components/ui/backbutton'
import { TutorialStatus } from '@/components/tutorials/tutorial-status'
import { TutorialQuizCTA } from '@/components/tutorials/tutorial-quiz-cta'
import ScrollProgress from '@/components/ui/scroll-progress'
import { Tutorial } from '@/types/tutorial/tutorial'

interface TutorialPageContentProps {
  tutorial: Tutorial
  fullLinkGenerated: string
  quizSlug: string
}

export default function TutorialPageContent({
  tutorial,
  fullLinkGenerated,
  quizSlug,
}: TutorialPageContentProps) {
  return (
    <>
      <ScrollProgress className='top-[80px] z-50' />
      <div className='xl:px-24 lg:px-16 md:px-8 sm:px-8 px-8'>
        <div className='flex items-start justify-between mb-4'>
          <BackButton href='/tutorials' />
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
          {tutorial.description && (
            <p className='text-xl mt-0 text-muted-foreground dark:text-muted-foreground'>
              {tutorial.description}
            </p>
          )}
          <hr className='my-4 mb-16' />
          <div className='text-xl mx-auto xl:px-24 lg:px-16 md:px-8 sm:px-0'>
            <MDXContent code={tutorial.body} />
          </div>
        </article>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.0 }}
          className='mx-auto xl:px-24 lg:px-16 md:px-8 sm:px-0 my-16'
        >
          <TutorialQuizCTA quizSlug={quizSlug} className='w-full ' />
        </motion.div>
      </div>
    </>
  )
}
