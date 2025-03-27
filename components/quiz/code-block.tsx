interface CodeBlockProps {
  language?: string
  children: string
}

export function CodeBlock({ language = 'python', children }: CodeBlockProps) {
  return (
    <div className='my-3 rounded-md overflow-hidden'>
      <div className='bg-gray-700 text-white text-xs px-3 py-1'>{language}</div>
      <pre className='bg-gray-100 dark:bg-gray-800 p-4 overflow-x-auto text-sm font-mono'>
        <code>{children}</code>
      </pre>
    </div>
  )
}
