import { Problem } from '../types/problem'

const validateCode = (userCode: string): boolean => {
  try {
    const functionBodyMatch = userCode.match(
      /def count_words\(text\):\s*([\s\S]*)/
    )
    if (!functionBodyMatch) throw new Error('Function definition not found')
    const functionBody = functionBodyMatch[1].trim()

    // Basic validation
    if (!functionBody.includes('return')) {
      throw new Error('Function must return a dictionary')
    }

    // Check for dictionary operations
    if (!functionBody.includes('{}') && !functionBody.includes('dict(')) {
      throw new Error('Create and use a dictionary')
    }

    // Check for string methods
    if (!functionBody.includes('.lower()') || !functionBody.includes('split')) {
      throw new Error('Process the text using string methods')
    }

    return true
  } catch (error: any) {
    console.error('Word counter validation error:', error.message)
    throw error
  }
}

export const wordCounterHandler = (userCode: string): boolean => {
  return validateCode(userCode)
}

const starterCodePython = `def count_words(text):
    # Count the frequency of each word in the text
    # Return a dictionary with words as keys and their counts as values
    # Example: count_words("hello world hello") should return {"hello": 2, "world": 1}
    pass`

export const wordCounterProblem: Problem = {
  id: 'count-words',
  title: '7. Word Frequency Counter',
  problemStatement: `
    <p class='mt-3'>Let's build a word frequency counter using dictionaries!</p>
    <p class='mt-3'>Write a function called <code>count_words</code> that:</p>
    <ul class='mt-3'>
      <li>Takes a string of text as input</li>
      <li>Counts how many times each word appears in the text</li>
      <li>Returns a dictionary where:
        <ul>
          <li>Keys are the words (converted to lowercase)</li>
          <li>Values are the number of times each word appears</li>
        </ul>
      </li>
      <li>Ignores case (treats "Hello" and "hello" as the same word)</li>
    </ul>
  `,
  examples: [
    {
      id: 0,
      inputText: '"hello world hello"',
      outputText: '{"hello": 2, "world": 1}',
      explanation: 'The word "hello" appears twice, "world" appears once',
    },
    {
      id: 1,
      inputText: '"The cat and the Dog"',
      outputText: '{"the": 2, "cat": 1, "and": 1, "dog": 1}',
      explanation: 'Case is ignored, so "The" and "the" count as the same word',
    },
  ],
  testCases: [
    { input: '"hello world hello"', expected: "{'hello': 2, 'world': 1}" },
    {
      input: '"The cat and the Dog"',
      expected: "{'the': 2, 'cat': 1, 'and': 1, 'dog': 1}",
    },
    { input: '"python python python"', expected: "{'python': 3}" },
    {
      input: '"One Two Three"',
      expected: "{'one': 1, 'two': 1, 'three': 1}",
    },
  ],
  constraints: `
    <li class='mt-2'>Input will be a string of words separated by spaces</li>
    <li class='mt-2'>Words should be converted to lowercase</li>
    <li class='mt-2'>Ignore punctuation and special characters</li>
    <li class='mt-2'>Return an empty dictionary for an empty string</li>
  `,
  starterCode: starterCodePython,
  handlerFunction: wordCounterHandler,
  starterFunctionName: 'count_words',
  order: 7,
}

// Solution:
// def count_words(text):
//     word_count = {}
//     for word in text.lower().split():
//         word_count[word] = word_count.get(word, 0) + 1
//     return word_count
