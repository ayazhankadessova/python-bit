import { LucideIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface StatCardProps {
  icon: LucideIcon
  title: string
  children: React.ReactNode
}

export function StatCard({ icon: Icon, title, children }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Icon className='h-5 w-5' />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
