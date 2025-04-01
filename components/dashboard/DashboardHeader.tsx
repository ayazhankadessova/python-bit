import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  title: string
  subtitle: string
  onSignOut: () => void
}

export function DashboardHeader({
  title,
  subtitle,
  onSignOut,
}: DashboardHeaderProps) {
  return (
    <div className='mb-8 flex justify-between items-center'>
      <div>
        <h1 className='text-4xl mb-2'>{title}</h1>
        <p className='text-gray-600'>{subtitle}</p>
      </div>
      <Button variant='secondary' onClick={onSignOut}>
        Sign Out
      </Button>
    </div>
  )
}
