import { Problem } from '@/types/utils'

export const helloWorldHandler = (userCode: string) => {
  try {
    // First, let's clean up the Python code and extract just the function body
    const functionBodyMatch = userCode.match(/def hello_world\(\):\s*([\s\S]*)/)
    if (!functionBodyMatch) {
      throw new Error('Invalid function definition')
    }

    const functionBody = functionBodyMatch[1].trim()

    // Extract the string from print statement
    const printMatch = functionBody.match(/print\("(.*)"\)/)
    if (!printMatch) {
      throw new Error('No print statement found')
    }

    const printedValue = printMatch[1]

    // Check if the output matches exactly
    if (printedValue !== 'Hello, World!') {
      throw new Error(`Expected "Hello, World!", but got "${printedValue}"`)
    }

    return true
  } catch (error: any) {
    console.log('Error from helloWorldHandler: ', error)
    throw new Error(error.message)
  }
}

const starterCodePython = `def hello_world():
    # Write your code here
    pass`

export const helloWorld: Problem = {
  id: 'hello-world',
  title: '1. Hello, World!',
  problemStatement: `<p class='mt-3'>Write a function that prints "Hello, World!"</p>
  <p class='mt-3'>This is a simple introductory problem to help you get started with Python programming. Your task is to create a function that prints the famous "Hello, World!" message.</p>
  `,
  examples: [
    {
      id: 0,
      inputText: 'No input required',
      outputText: 'Hello, World!',
      explanation:
        'The function should print exactly "Hello, World!" (including the exclamation mark)',
    },
  ],
  constraints: `<li class='mt-2'>The output must match exactly: "Hello, World!"</li>
<li class='mt-2'>Pay attention to capitalization and punctuation</li>`,
  starterCode: starterCodePython,
  handlerFunction: helloWorldHandler,
  starterFunctionName: 'def hello_world',
  order: 1,
}
