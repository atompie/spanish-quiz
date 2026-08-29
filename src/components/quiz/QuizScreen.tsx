import { useEffect, useRef, useState } from 'react'
import { isAnyAnswerCorrect } from '../../lib/answerChecker'
import { useTranslation } from '../../i18n/LanguageContext'
import type { useQuizSession } from '../../hooks/useQuizSession'
import type { Person, Pronoun, PronounType, TenseId } from '../../types/grammar'
import { ExplanationModal } from '../common/ExplanationModal'
import { ConfirmModal } from './ConfirmModal'
import { HintModal } from './HintModal'
import { QuestionCard } from './QuestionCard'
import { ResultsScreen } from './ResultsScreen'

interface PendingFeedback {
  correct: boolean
  acceptedAnswers: string[]
  promptTranslation: string
  verbId: string
  tense: TenseId
  person: Person
  pronounType: PronounType
  pronoun?: Pronoun
}

interface QuizScreenProps {
  session: ReturnType<typeof useQuizSession>
}

export function QuizScreen({ session }: QuizScreenProps) {
  const { t } = useTranslation()
  const { quizState, currentQuestion, score, hasMistakesToRepeat, startQuiz, answer, interruptQuiz } = session

  const [inputValue, setInputValue] = useState('')
  const [pendingFeedback, setPendingFeedback] = useState<PendingFeedback | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [showInterruptConfirm, setShowInterruptConfirm] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!pendingFeedback && currentQuestion) {
      inputRef.current?.focus()
    }
  }, [currentQuestion, pendingFeedback])

  function handleNewQuiz() {
    startQuiz('random')
    setPendingFeedback(null)
    setInputValue('')
    setShowHint(false)
    setShowExplanation(false)
  }

  function handleRepeatMistakes() {
    startQuiz('mistakes')
    setPendingFeedback(null)
    setInputValue('')
    setShowHint(false)
    setShowExplanation(false)
  }

  function handleInterrupt() {
    interruptQuiz()
    setShowInterruptConfirm(false)
    setPendingFeedback(null)
    setInputValue('')
    setShowHint(false)
    setShowExplanation(false)
  }

  if (quizState.finished && !pendingFeedback) {
    return (
      <ResultsScreen
        correct={score.correct}
        incorrect={score.incorrect}
        total={score.total}
        canRepeatMistakes={hasMistakesToRepeat}
        onRepeatMistakes={handleRepeatMistakes}
        onNewQuiz={handleNewQuiz}
      />
    )
  }

  if (!currentQuestion && !pendingFeedback) {
    return (
      <div className="empty-state">
        <p>{t.quizEmptyState}</p>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (pendingFeedback) {
      setPendingFeedback(null)
      setInputValue('')
      setShowHint(false)
      setShowExplanation(false)
      return
    }

    if (!currentQuestion) return

    const correct = isAnyAnswerCorrect(inputValue, currentQuestion.acceptedAnswers)
    setPendingFeedback({
      correct,
      acceptedAnswers: currentQuestion.acceptedAnswers,
      promptTranslation: currentQuestion.promptTranslation,
      verbId: currentQuestion.verbId,
      tense: currentQuestion.tense,
      person: currentQuestion.person,
      pronounType: currentQuestion.pronounType,
      pronoun: currentQuestion.pronoun,
    })
    answer(inputValue)
  }

  const questionNumber = pendingFeedback ? quizState.currentIndex : quizState.currentIndex + 1
  const total = quizState.questions.length
  const displayPrompt = pendingFeedback ? pendingFeedback.promptTranslation : (currentQuestion?.promptTranslation ?? '')

  const isLastQuestion = questionNumber >= total
  const primaryLabel = pendingFeedback ? (isLastQuestion ? t.quizSeeResults : t.quizNext) : t.quizCheck

  return (
    <>
      <div className="quiz-topbar">
        <button
          type="button"
          className="btn-icon"
          aria-label={t.quizInterrupt}
          title={t.quizInterrupt}
          onClick={() => setShowInterruptConfirm(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <QuestionCard
        current={questionNumber}
        total={total}
        prompt={displayPrompt}
        showHintButton={!pendingFeedback}
        onHint={() => setShowHint(true)}
      />

      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className={
            'answer-input' + (pendingFeedback ? (pendingFeedback.correct ? ' correct' : ' incorrect') : '')
          }
          type="text"
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={!!pendingFeedback}
          placeholder={t.quizPlaceholder}
        />

        {pendingFeedback && (
          <>
            <p className={'feedback ' + (pendingFeedback.correct ? 'correct' : 'incorrect')}>
              {pendingFeedback.correct ? t.quizCorrect : t.quizIncorrect}
            </p>
            <p className="feedback-answer">
              {t.quizCorrectAnswerLabel}
              <br />
              <strong>{pendingFeedback.acceptedAnswers.join(' / ')}</strong>
            </p>
            {!pendingFeedback.correct && (
              <button
                type="button"
                className="btn btn-secondary btn-explain"
                onClick={() => setShowExplanation(true)}
              >
                {t.quizExplain}
              </button>
            )}
          </>
        )}

        <button type="submit" className="btn btn-primary" disabled={!pendingFeedback && inputValue.trim() === ''}>
          {primaryLabel}
        </button>
      </form>

      <p className="quiz-tally">
        <span className="tally-correct">{score.correct} ✓</span>{'  '}
        <span className="tally-incorrect">{score.incorrect} ✗</span>
      </p>

      {showHint && currentQuestion && (
        <HintModal
          infinitive={currentQuestion.verbInfinitive}
          translation={currentQuestion.verbTranslation}
          onClose={() => setShowHint(false)}
        />
      )}

      {showExplanation && pendingFeedback && (
        <ExplanationModal
          verbId={pendingFeedback.verbId}
          tense={pendingFeedback.tense}
          person={pendingFeedback.person}
          pronounType={pendingFeedback.pronounType}
          pronoun={pendingFeedback.pronoun}
          onClose={() => setShowExplanation(false)}
        />
      )}

      {showInterruptConfirm && (
        <ConfirmModal
          title={t.quizInterruptTitle}
          message={t.quizInterruptMessage}
          confirmLabel={t.quizInterruptConfirm}
          cancelLabel={t.quizInterruptCancel}
          onConfirm={handleInterrupt}
          onCancel={() => setShowInterruptConfirm(false)}
        />
      )}
    </>
  )
}
