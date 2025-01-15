interface StatsCardProps {
  number: string
  text: string
}

export const StatsCard = ({ number, text }: StatsCardProps) => (
  <div className='bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 text-primary font-medium shadow-sm border border-blue-200/50 hover:shadow-md hover:from-blue-200 hover:via-blue-300 hover:to-blue-200 hover:-translate-y-0.5 active:translate-y-0 dark:from-blue-900/70 dark:via-blue-800/70 dark:to-blue-900/70 dark:border-blue-700/20 dark:hover:from-blue-800/70 dark:hover:via-blue-700/70 dark:hover:to-blue-800/70 p-4 rounded-lg text-center'>
    <div className='text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent'>
      {number}
    </div>
    <div className='text-sm text-muted-foreground'>{text}</div>
  </div>
)
