import { isAnyAnswerCorrect } from './answerChecker'
import type { AnsweredQuestion, QuizQuestion } from '../types/quiz'

export interface QuizState {
  questions: QuizQuestion[]
  currentIndex: number
  answers: AnsweredQuestion[]
  finished: boolean
}

export function createQuizState(questions: QuizQuestion[]): QuizState {
  return {
    questions,
    currentIndex: 0,
    answers: [],
    finished: questions.length === 0,
  }
}

export function submitAnswer(state: QuizState, userAnswer: string): QuizState {
  if (state.finished) return state

  const question = state.questions[state.currentIndex]
  const correct = isAnyAnswerCorrect(userAnswer, question.acceptedAnswers)
  const answered: AnsweredQuestion = { question, userAnswer, correct }
  const nextIndex = state.currentIndex + 1

  return {
    ...state,
    answers: [...state.answers, answered],
    currentIndex: nextIndex,
    finished: nextIndex >= state.questions.length,
  }
}

/** Kończy sesję wcześniej — pozostałe, jeszcze nieodpowiedziane pytania są odrzucane. */
export function abortQuiz(state: QuizState): QuizState {
  if (state.finished) return state
  return { ...state, finished: true }
}

export function getScore(state: QuizState): { correct: number; incorrect: number; total: number } {
  const correct = state.answers.filter((a) => a.correct).length
  return { correct, incorrect: state.answers.length - correct, total: state.answers.length }
}
