// @/utils/problems/index.ts
import { helloWorld } from './hello-world'
import { sayHelloProblem } from './say-hello'
import { Problem } from '../types/problem'
import { calculateAgeProblem } from './age-calculator'
import { temperatureConverterProblem } from './temperature-converter'
import { reverseStringProblem } from './reverse-string'
import { dataFilterProblem } from './filter-numbers'
import { listAverageProblem } from './calculate-average'

interface ProblemMap {
  [key: string]: Problem
}

export const problems: ProblemMap = {
  'hello-world': helloWorld,
  'say-hello': sayHelloProblem,
  'age-calculator': calculateAgeProblem,
  'temperature-converter': temperatureConverterProblem,
  'reverse-string': reverseStringProblem,
  'filter-numbers': dataFilterProblem,
  'calculate-average': listAverageProblem,
}
