import { ReactNode } from 'react'

interface HighlightedTextProps {
  children: ReactNode
}

export const HighlightedText = ({ children }: HighlightedTextProps) => (
  <span className='bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-1 rounded font-semibold'>
    {children}
  </span>
)
