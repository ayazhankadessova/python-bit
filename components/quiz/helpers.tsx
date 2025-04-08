import React from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'

export function renderQuestionText(text: string) {
  if (!text || !text.includes('```python')) {
    return text
  }

  const regex = /```python([\s\S]*?)```/g
  let lastIndex = 0
  const elements = []
  let key = 0
  const isDarkMode = document.documentElement.classList.contains('dark')

  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(
        <span key={key++}>{text.substring(lastIndex, match.index)}</span>
      )
    }

    const code = match[1].trim()
    const highlightedCode = Prism.highlight(
      code,
      Prism.languages.python,
      'python'
    )

    elements.push(
      <pre
        key={key++}
        className={`p-3 rounded-md my-2 overflow-x-auto ${
          isDarkMode
            ? 'bg-zinc-800 border border-zinc-700'
            : 'bg-zinc-100 border border-zinc-200'
        }`}
      >
        <code
          className='language-python text-sm'
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    )

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    elements.push(<span key={key++}>{text.substring(lastIndex)}</span>)
  }

  return <>{elements}</>
}
