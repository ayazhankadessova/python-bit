import React from 'react'

interface SectionProps {
  children: React.ReactNode
  className?: string
}

export const Section: React.FC<SectionProps> = ({ children, className }) => {
  return <section className={`mb-24 p-0 ${className || ''}`}>{children}</section>
}
