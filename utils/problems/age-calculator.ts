// age-calculator.ts
import { Problem } from '@/types/utils'

const validateCode = (userCode: string): boolean => {
  try {
    // Validate function definition
    const functionBodyMatch = userCode.match(
      /def age_calculator\(birth_year\):\s*([\s\S]*)/
    )
    if (!functionBodyMatch) throw new Error('Function definition not found')

    const functionBody = functionBodyMatch[1].trim()

    // Basic validation
    if (!functionBody.includes('return')) {
      throw new Error('Function must return a value')
    }

    if (!functionBody.includes('2024')) {
      throw new Error('Make sure to use the current year (2024)')
    }

    if (!functionBody.includes('-')) {
      throw new Error('Function should perform subtraction')
    }

    return true
  } catch (error: any) {
    console.error('Age calculator validation error:', error.message)
    throw error
  }
}

export const calculateAgeHandler = (userCode: string): boolean => {
  return validateCode(userCode)
}

const starterCodePython = `def age_calculator(birth_year):
    # Calculate and return the age in 2024
    # Example: if birth_year is 2000, return 24
    pass`

export const calculateAgeProblem: Problem = {
  id: 'age-calculator',
  title: '2. Age Calculator',
  problemStatement: `
    <p class='mt-3'>Let's practice working with variables and basic math!</p>
    <p class='mt-3'>Write a function called <code>calculate_age</code> that:</p>
    <ul class='mt-3'>
      <li>Takes a parameter <code>birth_year</code> (a number)</li>
      <li>Calculates how old someone will be in 2024</li>
      <li>Returns the calculated age</li>
    </ul>
    <p class='mt-3'>This task will help you understand:</p>
    <ul>
      <li>How to work with function parameters</li>
      <li>How to perform basic arithmetic</li>
      <li>How to return values from functions</li>
    </ul>
  `,
  examples: [
    {
      id: 0,
      inputText: '2000',
      outputText: '24',
      explanation: 'Someone born in 2000 will be 24 years old in 2024',
    },
    {
      id: 1,
      inputText: '1990',
      outputText: '34',
      explanation: 'Someone born in 1990 will be 34 years old in 2024',
    },
  ],
  testCases: [
    { input: 2000, expected: 24 },
    { input: 1990, expected: 34 },
    { input: 2010, expected: 14 },
  ],
  constraints: `
    <li class='mt-2'>birth_year will be a positive integer</li>
    <li class='mt-2'>Return the age as an integer</li>
    <li class='mt-2'>Assume the current year is 2024</li>
  `,
  starterCode: starterCodePython,
  handlerFunction: calculateAgeHandler,
  starterFunctionName: 'age_calculator',
  order: 2,
}
