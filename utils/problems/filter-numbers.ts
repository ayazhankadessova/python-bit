// data-filter.ts
import { Problem } from '../types/problem'

const validateCode = (userCode: string): boolean => {
  try {
    const functionBodyMatch = userCode.match(
      /def filter_numbers\(numbers, threshold\):\s*([\s\S]*)/
    )
    if (!functionBodyMatch) throw new Error('Function definition not found')

    const functionBody = functionBodyMatch[1].trim()

    // Basic validation
    if (!functionBody.includes('return')) {
      throw new Error('Function must return a list')
    }

    // Check for required list operations
    if (
      !functionBody.includes('append') &&
      !functionBody.includes('[') &&
      !functionBody.includes('for')
    ) {
      throw new Error(
        'Use list operations (append, list comprehension, or loop)'
      )
    }

    // Check for comparison
    if (!functionBody.includes('>')) {
      throw new Error('Use comparison operators to filter numbers')
    }

    return true
  } catch (error: any) {
    console.error('Data filter validation error:', error.message)
    throw error
  }
}

export const dataFilterHandler = (userCode: string): boolean => {
  return validateCode(userCode)
}

const starterCodePython = `def filter_numbers(numbers, threshold):
    # Return a new list containing only numbers greater than the threshold
    # Example: filter_numbers([1, 5, 3, 8, 2], 3) should return [5, 8]
    pass`

export const dataFilterProblem: Problem = {
  id: 'filter-numbers',
  title: '6. Data Filter',
  problemStatement: `
    <p class='mt-3'>Let's filter some data!</p>
    <p class='mt-3'>Write a function called <code>filter_numbers</code> that:</p>
    <ul class='mt-3'>
      <li>Takes two parameters:
        <ul>
          <li><code>numbers</code>: a list of numbers</li>
          <li><code>threshold</code>: a number</li>
        </ul>
      </li>
      <li>Returns a new list containing only the numbers that are greater than the threshold</li>
      <li>Maintains the original order of the numbers</li>
    </ul>
    <p class='mt-3'>This task will help you understand:</p>
    <ul>
      <li>List filtering and creation</li>
      <li>Using conditions with lists</li>
      <li>Multiple function parameters</li>
      <li>List comprehension (optional)</li>
    </ul>
  `,
  examples: [
    {
      id: 0,
      inputText: '[1, 5, 3, 8, 2], 3',
      outputText: '[5, 8]',
      explanation: 'Only 5 and 8 are greater than 3',
    },
    {
      id: 1,
      inputText: '[10, 20, 30, 40, 50], 25',
      outputText: '[30, 40, 50]',
      explanation: 'Only numbers greater than 25 are included',
    },
  ],
  testCases: [
    { input: '[1, 5, 3, 8, 2], 3', expected: [5, 8] },
    { input: '[10, 20, 30, 40, 50], 25', expected: [30, 40, 50] },
    { input: '[1, 2, 3, 4, 5], 10', expected: [] },
    { input: '[], 5', expected: [] },
    { input: '[10, 10, 10], 9', expected: [10, 10, 10] },
  ],
  constraints: `
    <li class='mt-2'>Input numbers will be integers</li>
    <li class='mt-2'>The list may be empty</li>
    <li class='mt-2'>Maintain the original order of numbers</li>
    <li class='mt-2'>Return an empty list if no numbers are greater than the threshold</li>
  `,
  starterCode: starterCodePython,
  handlerFunction: dataFilterHandler,
  starterFunctionName: 'filter_numbers',
  order: 6,
}

// def filter_numbers(numbers, threshold):
//     return [num for num in numbers if num > threshold]
