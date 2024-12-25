"use client"

import Image from 'next/image'
import * as runtime from 'react/jsx-runtime'
import React, { memo } from 'react'
// import { Callout } from './callout'
import CodeMirror from '@uiw/react-codemirror'
import  PythonCodeEditor  from './codeExecutor'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { python } from '@codemirror/lang-python'

const useMDXComponent = (code: string) => {
  const fn = new Function(code)
  const Component = fn({ ...runtime }).default
  Component.displayName = 'MDXContent'
  return Component
}

const components = {
  Image,
  PythonCodeEditor,
  li: ({ children }) => (
    <li className='text-lg mb-2'>
      {children}
    </li>
  ),
}

interface MdxProps {
  code: string
}

export const MDXContent = memo(({ code }: MdxProps) => {
  const Component = useMDXComponent(code)
  return <Component components={components} />
})

MDXContent.displayName = 'MyComponent'