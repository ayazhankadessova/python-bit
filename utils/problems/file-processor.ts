import { Problem } from '@/types/utils'

const validateCode = (userCode: string): boolean => {
  try {
    const functionBodyMatch = userCode.match(
      /def file_processor\(filename\):\s*([\s\S]*)/
    )
    if (!functionBodyMatch) throw new Error('Function definition not found')
    const functionBody = functionBodyMatch[1].trim()

    // Basic validation
    if (!functionBody.includes('return')) {
      throw new Error('Function must return processed data')
    }

    // Check for file operations
    if (!functionBody.includes('open(') || !functionBody.includes('with')) {
      throw new Error('Use file operations with proper context management')
    }

    // Check for error handling
    if (!functionBody.includes('try') || !functionBody.includes('except')) {
      throw new Error('Implement error handling')
    }

    return true
  } catch (error: any) {
    console.error('File processor validation error:', error.message)
    throw error
  }
}

export const fileProcessorHandler = (userCode: string): boolean => {
  return validateCode(userCode)
}

const starterCodePython = `def file_processor(filename):
    # Read the file and count lines, words, and characters
    # Return a dictionary with the counts
    # Handle file not found and permission errors
    # Example: file_processor("sample.txt") returns {"lines": 3, "words": 10, "chars": 50}
    pass`

export const fileProcessorProblem: Problem = {
  id: 'file-processor',
  title: '8. File Statistics Processor',
  problemStatement: `
    <p class='mt-3'>Let's work with files and create a file statistics processor!</p>
    <p class='mt-3'>Write a function called <code>file_processor</code> that:</p>
    <ul class='mt-3'>
      <li>Takes a filename as input</li>
      <li>Reads the file and counts:
        <ul>
          <li>Number of lines</li>
          <li>Number of words (space-separated)</li>
          <li>Number of characters (including whitespace)</li>
        </ul>
      </li>
      <li>Returns a dictionary with the counts</li>
      <li>Handles potential errors gracefully</li>
    </ul>
  `,
  examples: [
    {
      id: 0,
      inputText: '"sample.txt" (containing: "Hello world\\nPython is fun")',
      outputText: '{"lines": 2, "words": 4, "chars": 20}',
      explanation: '2 lines, 4 words, and 20 total characters',
    },
    {
      id: 1,
      inputText: '"empty.txt" (empty file)',
      outputText: '{"lines": 0, "words": 0, "chars": 0}',
      explanation: 'Empty file returns zero counts',
    },
  ],
  testCases: [
    {
      input: '"sample.txt"',
      expected: { lines: 2, words: 4, chars: 25 },
    },
    {
      input: '"empty.txt"',
      expected: { lines: 0, words: 0, chars: 0 },
    },
    {
      input: '"nonexistent.txt"',
      expected: { error: 'File not found' },
    },
  ],
  constraints: `
    <li class='mt-2'>Handle FileNotFoundError and PermissionError</li>
    <li class='mt-2'>Use with statement for file operations</li>
    <li class='mt-2'>Count empty lines in the line count</li>
    <li class='mt-2'>Return error message in dictionary if file cannot be processed</li>
  `,
  starterCode: starterCodePython,
  handlerFunction: fileProcessorHandler,
  starterFunctionName: 'file_processor',
  order: 8,
}

// Solution:
// def file_processor(filename):
//     try:
//         with open(filename, 'r') as file:
//             content = file.read()
//             lines = content.count('\n') + (1 if content else 0)
//             words = len(content.split()) if content else 0
//             chars = len(content)
//             return {"lines": lines, "words": words, "chars": chars}
//     except FileNotFoundError:
//         return {"error": "File not found"}
//     except PermissionError:
//         return {"error": "Permission denied"}
