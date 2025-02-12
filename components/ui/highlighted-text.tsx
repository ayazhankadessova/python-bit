import { ReactNode } from 'react'

interface HighlightedTextProps {
  children: ReactNode
}

export const HighlightedText = ({ children }: HighlightedTextProps) => (
  <span className='bg-gradient-to-r from-teal-500/30 to-teal-500/30 px-1 rounded font-semibold'>
    {children}
  </span>
)
