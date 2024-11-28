// list-average.ts
import { Problem } from '../types/problem'

const validateCode = (userCode: string): boolean => {
  try {
    const functionBodyMatch = userCode.match(
      /def calculate_average\(numbers\):\s*([\s\S]*)/
    )
    if (!functionBodyMatch) throw new Error('Function definition not found')

    const functionBody = functionBodyMatch[1].trim()

    // Basic validation
    if (!functionBody.includes('return')) {
      throw new Error('Function must return a value')
    }

    // Check for required operations
    if (
      !functionBody.includes('sum(') &&
      !functionBody.includes('len(') &&
      !functionBody.includes('for')
    ) {
      throw new Error(
        'Use list operations (sum, len) or a loop to calculate the average'
      )
    }

    if (!functionBody.includes('/')) {
      throw new Error('Division is needed to calculate the average')
    }

    if (!functionBody.includes('round') && !functionBody.includes('.2f')) {
      throw new Error('Round the result to 2 decimal places')
    }

    return true
  } catch (error: any) {
    console.error('List average validation error:', error.message)
    throw error
  }
}

export const listAverageHandler = (userCode: string): boolean => {
  return validateCode(userCode)
}

const starterCodePython = `def calculate_average(numbers):
    # Calculate and return the average of numbers in the list
    # Round the result to 2 decimal places
    # Example: calculate_average([1, 2, 3]) should return 2.00
    pass`

export const listAverageProblem: Problem = {
  id: 'calculate-average',
  title: '5. List Average Calculator',
  problemStatement: `
    <p class='mt-3'>Time to work with lists! Let's calculate some averages.</p>
    <p class='mt-3'>Write a function called <code>calculate_average</code> that:</p>
    <ul class='mt-3'>
      <li>Takes a list of numbers as input</li>
      <li>Calculates the average (mean) of all numbers in the list</li>
      <li>Returns the result rounded to 2 decimal places</li>
      <li>Returns 0.00 if the list is empty</li>
    </ul>
    <p class='mt-3'>This task will help you understand:</p>
    <ul>
      <li>How to work with Python lists</li>
      <li>List operations and methods</li>
      <li>Looping through lists</li>
      <li>Formatting decimal numbers</li>
    </ul>
  `,
  examples: [
    {
      id: 0,
      inputText: '[1, 2, 3]',
      outputText: '2.00',
      explanation: 'Sum is 6, divided by count of 3 = 2.00',
    },
    {
      id: 1,
      inputText: '[10, 20, 30, 40]',
      outputText: '25.00',
      explanation: 'Sum is 100, divided by count of 4 = 25.00',
    },
  ],
  testCases: [
    { input: '[1, 2, 3]', expected: 2 },
    { input: '[10, 20, 30, 40]', expected: 25 },
    { input: '[1.5, 2.5, 3.5]', expected: 2.5 },
    { input: '[]', expected: 0.0 },
    { input: '[100]', expected: 100.0 },
  ],
  constraints: `
    <li class='mt-2'>Input will be a list of numbers (integers or floats)</li>
    <li class='mt-2'>The list may be empty</li>
    <li class='mt-2'>Return the average rounded to exactly 2 decimal places</li>
    <li class='mt-2'>Return "0.00" for an empty list</li>
  `,
  starterCode: starterCodePython,
  handlerFunction: listAverageHandler,
  starterFunctionName: 'calculate_average',
  order: 5,
}

// def calculate_average(numbers):
//     if not numbers:
//         return 0.00
//     return round(sum(numbers) / len(numbers), 2)
