import { useTranslation } from '../../i18n/LanguageContext'
import type { ListeningAnswerWaitSeconds } from '../../types/quiz'

const OPTIONS: ListeningAnswerWaitSeconds[] = [3, 5, 10]

interface AnswerWaitPickerProps {
  value: ListeningAnswerWaitSeconds
  onChange: (seconds: ListeningAnswerWaitSeconds) => void
}

export function AnswerWaitPicker({ value, onChange }: AnswerWaitPickerProps) {
  const { t } = useTranslation()

  return (
    <div className="answer-wait-picker" role="group" aria-label={t.settingsListeningWaitTime}>
      {OPTIONS.map((seconds) => (
        <button
          key={seconds}
          type="button"
          className={`answer-wait-picker-option${seconds === value ? ' answer-wait-picker-option--active' : ''}`}
          aria-pressed={seconds === value}
          title={`${t.settingsListeningWaitTime}: ${seconds}s`}
          onClick={() => onChange(seconds)}
        >
          {seconds}
        </button>
      ))}
    </div>
  )
}
