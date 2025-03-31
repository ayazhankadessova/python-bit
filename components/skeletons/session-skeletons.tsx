import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export const ActiveSessionSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle>Session Management</CardTitle>
    </CardHeader>
    <CardContent>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <div className='h-5 w-40 bg-muted animate-pulse rounded' />
          <div className='h-4 w-32 bg-muted animate-pulse rounded' />
          <div className='h-4 w-28 bg-muted animate-pulse rounded' />
        </div>
        <div className='h-9 w-24 bg-muted animate-pulse rounded' />
      </div>
    </CardContent>
  </Card>
)

export const SessionHistorySkeleton = () => (
  <Card>
    <CardHeader>
      <div className='flex justify-between items-center'>
        <div>
          <div className='h-5 w-32 bg-muted animate-pulse rounded mb-2' />
          <div className='h-4 w-40 bg-muted animate-pulse rounded' />
        </div>
        <div className='h-10 w-[180px] bg-muted animate-pulse rounded' />
      </div>
      <div className='mt-4'>
        <div className='h-10 w-[320px] bg-muted animate-pulse rounded' />
      </div>
    </CardHeader>
    <CardContent>
      <div className='space-y-4'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='p-4 rounded-lg border bg-card'>
            <div className='flex justify-between items-start'>
              <div className='space-y-2'>
                <div className='h-5 w-48 bg-muted animate-pulse rounded' />
                <div className='h-4 w-32 bg-muted animate-pulse rounded' />
                <div className='h-4 w-36 bg-muted animate-pulse rounded' />
              </div>
              <div className='h-4 w-16 bg-muted animate-pulse rounded' />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)
