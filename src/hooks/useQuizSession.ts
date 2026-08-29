import { useCallback, useState } from 'react'
import { VERBS } from '../data/verbs'
import { generateQuiz } from '../lib/questionGenerator'
import { abortQuiz, createQuizState, getScore, submitAnswer, type QuizState } from '../lib/quizEngine'
import {
  appendHistory,
  clearMistake,
  clearMistakes,
  loadMistakes,
  loadSettings,
  recordMistake,
  saveSettings,
} from '../lib/storage'
import type { QuizMode, QuizSettings } from '../types/quiz'

function buildQuizState(settings: QuizSettings): QuizState {
  const mistakeIds = settings.mode === 'mistakes' ? new Set(Object.keys(loadMistakes())) : undefined
  const questions = generateQuiz(VERBS, settings, mistakeIds)
  return createQuizState(questions)
}

export function useQuizSession() {
  const [settings, setSettings] = useState<QuizSettings>(() => loadSettings())
  const [quizState, setQuizState] = useState<QuizState>(() => buildQuizState(settings))

  const updateSettings = useCallback(
    (partial: Partial<QuizSettings>) => {
      const next = { ...settings, ...partial }
      setSettings(next)
      saveSettings(next)
      setQuizState(buildQuizState(next))
    },
    [settings],
  )

  const startQuiz = useCallback(
    (mode: QuizMode = 'random') => {
      if (mode === 'random') {
        clearMistakes()
      }
      const effectiveSettings = { ...settings, mode }
      setSettings(effectiveSettings)
      saveSettings(effectiveSettings)
      setQuizState(buildQuizState(effectiveSettings))
    },
    [settings],
  )

  const answer = useCallback((userAnswer: string) => {
    setQuizState((prev) => {
      const next = submitAnswer(prev, userAnswer)
      const answered = next.answers[next.answers.length - 1]

      if (answered.correct) {
        clearMistake(answered.question.id)
      } else {
        recordMistake(answered.question.id, answered.question.verbId, userAnswer)
      }

      if (next.finished) {
        const score = getScore(next)
        appendHistory({
          date: new Date().toISOString(),
          correct: score.correct,
          incorrect: score.incorrect,
          total: score.total,
        })
      }

      return next
    })
  }, [])

  const interruptQuiz = useCallback(() => {
    setQuizState((prev) => {
      if (prev.finished) return prev
      const next = abortQuiz(prev)
      const score = getScore(next)
      appendHistory({
        date: new Date().toISOString(),
        correct: score.correct,
        incorrect: score.incorrect,
        total: score.total,
      })
      return next
    })
  }, [])

  const currentQuestion = quizState.finished ? undefined : quizState.questions[quizState.currentIndex]
  const score = getScore(quizState)
  const hasMistakesToRepeat = quizState.answers.some((a) => !a.correct)

  return {
    settings,
    updateSettings,
    quizState,
    currentQuestion,
    score,
    hasMistakesToRepeat,
    startQuiz,
    answer,
    interruptQuiz,
  }
}
