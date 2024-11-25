import { reverseLinkedList } from './reverse-linked-list'
import { twoSum } from './two-sum'
import { validParentheses } from './valid-parentheses'
import { Problem } from '../types/problem'

interface ProblemMap {
  [key: string]: Problem
}

export const problems: ProblemMap = {
  'two-sum': twoSum,
  'reverse-linked-list': reverseLinkedList,
  'valid-parentheses': validParentheses,
}
