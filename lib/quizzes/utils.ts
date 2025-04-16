import { Quiz } from '@/types/quiz/quiz'

export const filterQuizzesBySearchTerm = (
  quizzes: Quiz[],
  searchTerm: string
): Quiz[] => {
  if (!searchTerm) return quizzes

  const lowerCaseSearchTerm = searchTerm.toLowerCase()
  return quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(lowerCaseSearchTerm) ||
      quiz.description.toLowerCase().includes(lowerCaseSearchTerm)
  )
}

export const sortQuizzesByDifficulty = (quizzes: Quiz[]): Quiz[] => {
  return [...quizzes].sort((a, b) => a.questions.length - b.questions.length)
}

export const sortQuizzesByTime = (quizzes: Quiz[]): Quiz[] => {
  return [...quizzes].sort((a, b) => b.id.localeCompare(a.id))
}