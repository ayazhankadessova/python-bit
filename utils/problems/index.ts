// @/utils/problems/index.ts
import { helloWorld } from './hello-world'
import { twoSum } from './two-sum'
import { validParentheses } from './valid-parentheses'
import { Problem } from '../types/problem'

interface ProblemMap {
  [key: string]: Problem
}

export const problems: ProblemMap = {
  'two-sum': twoSum,
  'hello-world': helloWorld,
  'valid-parentheses': validParentheses,
}
