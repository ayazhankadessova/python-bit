// components/MarkdownRenderer.tsx
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Image from 'next/image'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  return (
    <ReactMarkdown
      className={`prose dark:prose-invert max-w-none ${className}`}
      remarkPlugins={[remarkGfm]}
      components={{
        // Custom image component using Next.js Image
        img({ src, alt }) {
          if (!src) return null
          return (
            <div className='relative w-full h-64 my-4'>
              <Image
                src={src}
                alt={alt || ''}
                fill
                className='object-contain'
              />
            </div>
          )
        },
        // Custom heading styles
        h1: ({ children }) => (
          <h1 className='text-2xl font-bold mb-4'>{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className='text-xl font-bold mb-3'>{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className='text-lg font-bold mb-2'>{children}</h3>
        ),
        // Custom paragraph style
        p: ({ children }) => (
          <p className='mb-4 text-base leading-relaxed'>{children}</p>
        ),
        // Custom list styles
        ul: ({ children }) => (
          <ul className='list-disc list-inside mb-4 space-y-2'>{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className='list-decimal list-inside mb-4 space-y-2'>
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className='text-base leading-relaxed'>{children}</li>
        ),
        // Custom blockquote style
        blockquote: ({ children }) => (
          <blockquote className='border-l-4 border-gray-300 pl-4 italic my-4'>
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownRenderer
