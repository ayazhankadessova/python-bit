import React from 'react'

interface SectionProps {
  children: React.ReactNode
  className?: string
}

export const Section: React.FC<SectionProps> = ({ children, className }) => {
  return (
    <section
      className={`pt-16 pb-16 xl:px-24 lg:px-16 md:px-8 sm:px-8 px-8 ${
        className || ''
      }`}
    >
      {children}
    </section>
  )
}
