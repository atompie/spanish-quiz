import { useState } from 'react'
import { useSpeakLessons } from '../../hooks/useSpeakLessons'
import { useTranslation } from '../../i18n/LanguageContext'
import {
  estimateLessonSeconds,
  formatEstimatedDuration,
  getEligibleItems,
  getLessonTopicWord,
} from '../../lib/listeningSession'
import { loadCompletedLessons, toggleCompletedLesson } from '../../lib/storage'
import type { LanguageCode } from '../../types/language'
import type { ListeningAnswerWaitSeconds } from '../../types/quiz'
import { CheckIcon } from '../common/CheckIcon'

interface LessonPickerProps {
  onSelect: (lesson: string) => void
  nativeLanguage: LanguageCode
  answerWaitSeconds: ListeningAnswerWaitSeconds
}

function lessonLabel(lesson: string, lessonLabelText: string): string {
  const match = /^lesson_(\d+)$/.exec(lesson)
  return match ? `${lessonLabelText} ${match[1]}` : lesson
}

export function LessonPicker({ onSelect, nativeLanguage, answerWaitSeconds }: LessonPickerProps) {
  const { t } = useTranslation()
  const { lessons, manifest, metadata, hasError } = useSpeakLessons()
  const [completed, setCompleted] = useState<string[]>(() => loadCompletedLessons())

  function lessonDurationLabel(lesson: string): string | null {
    if (!manifest) return null
    const eligible = getEligibleItems(manifest, metadata, nativeLanguage, lesson)
    const seconds = estimateLessonSeconds(eligible, answerWaitSeconds)
    if (seconds === 0) return null
    const { hours, minutes } = formatEstimatedDuration(seconds)
    return hours > 0 ? `${hours} ${t.listeningHoursAbbrev} ${minutes} ${t.listeningMinutesAbbrev}` : `${minutes} ${t.listeningMinutesAbbrev}`
  }

  function handleToggleCompleted(lesson: string) {
    setCompleted(toggleCompletedLesson(lesson))
  }

  if (hasError) {
    return (
      <div className="empty-state">
        <p>{t.listeningLessonsLoadError}</p>
      </div>
    )
  }

  if (lessons === null) {
    return null
  }

  if (lessons.length === 0) {
    return (
      <div className="empty-state">
        <p>{t.listeningLessonsEmptyState}</p>
      </div>
    )
  }

  return (
    <div className="quiz-kind-picker">
      <h2>{t.listeningLessonPickerTitle}</h2>
      {lessons.map((lesson) => {
        const isCompleted = completed.includes(lesson)
        const durationLabel = lessonDurationLabel(lesson)
        const topicWord = getLessonTopicWord(metadata, lesson)
        const descriptionLabel = [topicWord, durationLabel].filter(Boolean).join(' · ')
        return (
          <div key={lesson} className="quiz-kind-option lesson-option">
            <button type="button" className="lesson-option-select" onClick={() => onSelect(lesson)}>
              <span className="quiz-kind-option-title">{lessonLabel(lesson, t.listeningLessonLabel)}</span>
              {descriptionLabel && <span className="quiz-kind-option-description">{descriptionLabel}</span>}
            </button>
            <button
              type="button"
              className={`btn-icon btn-icon--sm${isCompleted ? ' btn-icon--inverted' : ''}`}
              aria-label={t.listeningLessonCompletedLabel}
              title={t.listeningLessonCompletedLabel}
              aria-pressed={isCompleted}
              onClick={() => handleToggleCompleted(lesson)}
            >
              <CheckIcon />
            </button>
          </div>
        )
      })}
    </div>
  )
}
