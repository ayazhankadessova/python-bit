import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

interface FeatureItemProps {
  icon: ReactNode
  title: string
  description: string
  buttonText: string
  buttonLink: string
  router: AppRouterInstance
}

export const FeatureItem = ({
  icon,
  title,
  description,
  buttonText,
  buttonLink,
  router,
}: FeatureItemProps) => (
  <div className='flex gap-6 items-start'>
    <div className='flex-shrink-0 p-3 rounded-lg shadow-md shadow-purple-200'>
      {icon}
    </div>
    <div className='space-y-4'>
      <div>
        <h4 className='text-xl font-semibold mb-2'>{title}</h4>
        <p className='text-muted-foreground'>{description}</p>
      </div>
      <Button
        className='group'
        variant='softBlue'
        onClick={() => router.push(buttonLink)}
      >
        {buttonText}
        <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
      </Button>
    </div>
  </div>
)
