import { Problem } from '../types/problem'

const validateCode = (userCode: string): boolean => {
  try {
    // Validate function definition
    const functionBodyMatch = userCode.match(
      /def temperature_converter\(celsius\):\s*([\s\S]*)/
    )
    if (!functionBodyMatch) throw new Error('Function definition not found')

    const functionBody = functionBodyMatch[1].trim()

    // Basic validation
    if (!functionBody.includes('return')) {
      throw new Error('Function must return a value')
    }

    // Check for required operations
    if (!functionBody.includes('*') && !functionBody.includes('/')) {
      throw new Error(
        'Function should use multiplication and division operations'
      )
    }

    if (!functionBody.includes('32')) {
      throw new Error('Make sure to add 32 in the conversion formula')
    }

    // Check for rounding/decimal handling
    if (!functionBody.includes('round') && !functionBody.includes('.1f')) {
      throw new Error('Remember to round to one decimal place')
    }

    return true
  } catch (error: any) {
    console.error('Temperature converter validation error:', error.message)
    throw error
  }
}

export const temperatureConverterHandler = (userCode: string): boolean => {
  return validateCode(userCode)
}

const starterCodePython = `def temperature_converter(celsius):
    # Convert celsius to fahrenheit using the formula: (C × 9/5) + 32
    # Remember to round to one decimal place
    # Example: convert_to_fahrenheit(0) should return 32.0
    pass`

export const temperatureConverterProblem: Problem = {
  id: 'temperature-converter',
  title: '3. Temperature Converter',
  problemStatement: `
    <p class='mt-3'>Let's create a useful temperature conversion program!</p>
    <p class='mt-3'>Write a function called <code>convert_to_fahrenheit</code> that:</p>
    <ul class='mt-3'>
      <li>Takes a temperature in Celsius as input (a number)</li>
      <li>Converts it to Fahrenheit using the formula: (C × 9/5) + 32</li>
      <li>Returns the result rounded to one decimal place</li>
    </ul>
    <p class='mt-3'>This task will help you understand:</p>
    <ul>
      <li>How to work with floating-point numbers</li>
      <li>How to use mathematical operations</li>
      <li>How to format and round numbers</li>
      <li>Real-world application of programming</li>
    </ul>
  `,
  examples: [
    {
      id: 0,
      inputText: '0',
      outputText: '32.0',
      explanation: 'The freezing point of water: 0°C = 32°F',
    },
    {
      id: 1,
      inputText: '100',
      outputText: '212.0',
      explanation: 'The boiling point of water: 100°C = 212°F',
    },
    {
      id: 2,
      inputText: '37',
      outputText: '98.6',
      explanation: 'Normal body temperature: 37°C = 98.6°F',
    },
  ],
  testCases: [
    { input: 0, expected: 32.0 },
    { input: 100, expected: 212.0 },
    { input: -40, expected: -40.0 },
    { input: 37, expected: 98.6 },
    { input: 25, expected: 77.0 },
    { input: -10, expected: 14.0 },
  ],
  constraints: `
    <li class='mt-2'>Input will be a number (can be positive, negative, or zero)</li>
    <li class='mt-2'>Output must be rounded to exactly one decimal place</li>
    <li class='mt-2'>Use the formula: (C × 9/5) + 32</li>
    <li class='mt-2'>Return value must be a string in the format "XX.X"</li>
  `,
  starterCode: starterCodePython,
  handlerFunction: temperatureConverterHandler,
  starterFunctionName: 'temperature_converter',
  order: 3,
}

// def temperature_converter(celsius):
//     # Calculate using the formula (C × 9/5) + 32
//     fahrenheit = (celsius * 9/5) + 32

//     # Format the result to one decimal place
//     return round(fahrenheit, 1)
