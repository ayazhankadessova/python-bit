// string-reverser.ts
import { Problem } from '@/types/utils'

const validateCode = (userCode: string): boolean => {
  try {
    const functionBodyMatch = userCode.match(
      /def reverse_string\(text\):\s*([\s\S]*)/
    )
    if (!functionBodyMatch) throw new Error('Function definition not found')

    const functionBody = functionBodyMatch[1].trim()

    // Basic validation
    if (!functionBody.includes('return')) {
      throw new Error('Function must return a value')
    }

    // Check for string operations
    if (
      !functionBody.includes('[::-1]') &&
      !functionBody.includes('reversed') &&
      !functionBody.includes('for') &&
      !functionBody.includes('while')
    ) {
      throw new Error(
        'Use string slicing, reversed(), or a loop to reverse the string'
      )
    }

    return true
  } catch (error: any) {
    console.error('String reverser validation error:', error.message)
    throw error
  }
}

export const reverseStringHandler = (userCode: string): boolean => {
  return validateCode(userCode)
}

const starterCodePython = `def reverse_string(text):
    # Return the reversed version of the input string
    # Example: reverse_string("hello") should return "olleh"
    pass`

export const reverseStringProblem: Problem = {
  id: 'reverse-string',
  title: '4. String Reverser',
  problemStatement: `
    <p class='mt-3'>Let's learn how to manipulate strings in Python!</p>
    <p class='mt-3'>Write a function called <code>reverse_string</code> that:</p>
    <ul class='mt-3'>
      <li>Takes a string parameter <code>text</code></li>
      <li>Returns the string in reverse order</li>
      <li>Maintains the original case of all letters</li>
    </ul>
    <p class='mt-3'>This task will help you understand:</p>
    <ul>
      <li>String manipulation in Python</li>
      <li>Different ways to iterate through strings</li>
      <li>String slicing operations</li>
    </ul>
  `,
  examples: [
    {
      id: 0,
      inputText: '"hello"',
      outputText: '"olleh"',
      explanation: 'Each character appears in reverse order',
    },
    {
      id: 1,
      inputText: '"Python"',
      outputText: '"nohtyP"',
      explanation: 'Case is preserved in the reversed string',
    },
  ],
  testCases: [
    { input: 'hello', expected: 'olleh' },
    { input: 'Python', expected: 'nohtyP' },
    { input: '12345', expected: '54321' },
    { input: 'Hi There!', expected: '!erehT iH' },
    { input: '', expected: '' },
  ],
  constraints: `
    <li class='mt-2'>Input will be a string (can be empty)</li>
    <li class='mt-2'>Preserve the case of all letters</li>
    <li class='mt-2'>Special characters and spaces should also be reversed</li>
    <li class='mt-2'>Return the reversed string</li>
  `,
  starterCode: starterCodePython,
  handlerFunction: reverseStringHandler,
  starterFunctionName: 'reverse_string',
  order: 4,
}

// return text[::-1]
