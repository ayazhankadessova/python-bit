import { Problem } from '../types/problem'

export const sayHelloHandler = (userCode: string) => {
  try {
    const functionBodyMatch = userCode.match(/def say_hello\(\):\s*([\s\S]*)/)
    if (!functionBodyMatch) throw new Error('Function definition not found')

    const functionBody = functionBodyMatch[1].trim()
    const printMatch = functionBody.match(/print\("(.*)"\)/)
    if (!printMatch) throw new Error('Print statement not found')

    if (printMatch[1] !== 'Hello, Python!') {
      throw new Error(`Expected "Hello, Python!", but got "${printMatch[1]}"`)
    }
    return true
  } catch (error: any) {
    throw new Error(error.message)
  }
}

const starterCodePython = `def say_hello():
    # Your first Python function!
    # Write a line of code that prints "Hello, Python!"
    pass`

export const sayHelloProblem: Problem = {
  id: 'say-hello',
  title: '1. Say Hello to Python',
  problemStatement: `
    <p class='mt-3'>Welcome to Python! Let's write your first Python function.</p>
    <p class='mt-3'>Create a function called <code>say_hello</code> that prints the message "Hello, Python!"</p>
    <p class='mt-3'>This task will help you understand:</p>
    <ul class='mt-3'>
      <li>How to define a function in Python</li>
      <li>How to use the print statement</li>
      <li>The importance of exact string matching</li>
    </ul>
  `,
  examples: [
    {
      id: 0,
      inputText: 'say_hello()',
      outputText: 'Hello, Python!',
      explanation:
        'When the function is called, it prints exactly "Hello, Python!"',
    },
  ],
  constraints: `
    <li class='mt-2'>The output must match exactly: "Hello, Python!"</li>
    <li class='mt-2'>Pay attention to capitalization and punctuation</li>
    <li class='mt-2'>The function must be named say_hello</li>
  `,
  starterCode: starterCodePython,
  handlerFunction: sayHelloHandler,
  starterFunctionName: 'def say_hello',
  order: 1,
}
