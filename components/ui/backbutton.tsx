'use client'

import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }
  return (
    <Button variant='ghost' onClick={handleGoBack} className='-ml-3 pl-2'>
      <ChevronLeft className='h-6 w-6' />
      <b>BACK</b>
    </Button>
  )
}
