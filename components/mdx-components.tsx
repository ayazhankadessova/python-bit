'use client'
import Image from 'next/image'
import * as runtime from 'react/jsx-runtime'
import React, { memo } from 'react'
import PythonCodeEditor from './codeExecutor'

const useMDXComponent = (code: string) => {
  const fn = new Function(code)
  const Component = fn({ ...runtime }).default
  Component.displayName = 'MDXContent'
  return Component
}

const components = {
  Image,
  PythonCodeEditor,
  // li: ({ children }: { children: React.ReactNode }) => (
  //   <li className='text-lg mb-2'>{children}</li>
  // ),
  // p: ({ children }: { children: React.ReactNode }) => (
  //   <p className='text-xl text-foreground dark:text-foreground'>{children}</p>
  // ),
}

interface MdxProps {
  code: string
}

export const MDXContent = memo(({ code }: MdxProps) => {
  const Component = useMDXComponent(code)
  return (
      <Component components={components} />
  )
})

MDXContent.displayName = 'MDXContent'
