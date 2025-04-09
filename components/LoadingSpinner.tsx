import { Loader2 } from 'lucide-react'

export function LoadingSpinner() {
  return (
    <div className='flex items-center justify-center min-h-screen'>
      <Loader2 className='h-8 w-8 animate-spin' />
      <p className='mt-4'>Loading...</p>
    </div>
  )
}
