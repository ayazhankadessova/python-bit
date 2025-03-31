interface MonitoringState {
  isTabActive: boolean
  isFullscreen: boolean
  lastActiveTime: number
  screenWidth: number
  browserWidth: number
}

interface MonitoringIndicatorProps {
  state: MonitoringState
}

export const MonitoringIndicator: React.FC<MonitoringIndicatorProps> = ({ state }) => {
  const isFullyFocused =
    state.isTabActive && state.browserWidth === state.screenWidth

  return (
    <div className='flex items-center gap-2'>
      <div
        className={`w-2 h-2 rounded-full ${
          state.isTabActive ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className='text-sm text-muted-foreground'>
        {isFullyFocused ? 'Fully Focused' : 'Distracted'}
      </span>
    </div>
  )
}
