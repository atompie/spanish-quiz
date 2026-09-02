import { useState } from 'react'
import { useSpeakLessons } from '../../hooks/useSpeakLessons'
import { useTranslation } from '../../i18n/LanguageContext'
import { loadCompletedLessons, toggleCompletedLesson } from '../../lib/storage'
import { CheckIcon } from '../common/CheckIcon'

interface LessonPickerProps {
  onSelect: (lesson: string) => void
}

function lessonLabel(lesson: string, lessonLabelText: string): string {
  const match = /^lesson_(\d+)$/.exec(lesson)
  return match ? `${lessonLabelText} ${match[1]}` : lesson
}

export function LessonPicker({ onSelect }: LessonPickerProps) {
  const { t } = useTranslation()
  const { lessons, hasError } = useSpeakLessons()
  const [completed, setCompleted] = useState<string[]>(() => loadCompletedLessons())

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
        return (
          <div key={lesson} className="quiz-kind-option lesson-option">
            <button type="button" className="lesson-option-select" onClick={() => onSelect(lesson)}>
              <span className="quiz-kind-option-title">{lessonLabel(lesson, t.listeningLessonLabel)}</span>
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
