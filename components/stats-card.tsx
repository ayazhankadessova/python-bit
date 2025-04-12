interface StatsCardProps {
  number: string
  text: string
}

export const StatsCard = ({ number, text }: StatsCardProps) => (
  <div className='bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 text-primary font-normal shadow-sm border border-purple-200/50 hover:shadow-md hover:from-purple-200 hover:via-purple-300 hover:to-purple-200 hover:-translate-y-0.5 active:translate-y-0 dark:from-purple-900/70 dark:via-purple-800/70 dark:to-purple-900/70 dark:border-purple-700/20 dark:hover:from-purple-800/70 dark:hover:via-purple-700/70 dark:hover:to-purple-800/70 p-4 rounded-lg text-center'>
    <div className='text-2xl font-bold bg-gradient-to-r from-purple-500 to-purple-500 bg-clip-text text-purple-800 dark:text-purple-100'>
      {number}
    </div>
    <div className='text-sm text-purple-900 dark:text-purple-200'>{text}</div>
  </div>
)
