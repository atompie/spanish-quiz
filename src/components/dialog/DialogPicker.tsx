import { useDialogLessons } from '../../hooks/useDialogLessons'
import { useTranslation } from '../../i18n/LanguageContext'

interface DialogPickerProps {
  onSelect: (dialog: string) => void
}

function dialogLabel(dialog: string, dialogLabelText: string): string {
  const match = /^dialog_(\d+)$/.exec(dialog)
  return match ? `${dialogLabelText} ${match[1]}` : dialog
}

export function DialogPicker({ onSelect }: DialogPickerProps) {
  const { t } = useTranslation()
  const { dialogs, metadata, hasError } = useDialogLessons()

  if (hasError) {
    return (
      <div className="empty-state">
        <p>{t.dialogListLoadError}</p>
      </div>
    )
  }

  if (dialogs === null) {
    return null
  }

  if (dialogs.length === 0) {
    return (
      <div className="empty-state">
        <p>{t.dialogListEmptyState}</p>
      </div>
    )
  }

  return (
    <div className="quiz-kind-picker">
      <h2>{t.dialogPickerTitle}</h2>
      {dialogs.map((dialog) => {
        const firstTurn = metadata?.[dialog]?.text[0]
        return (
          <button
            key={dialog}
            type="button"
            className="quiz-kind-option"
            onClick={() => onSelect(dialog)}
          >
            <span className="quiz-kind-option-title">{dialogLabel(dialog, t.dialogLabel)}</span>
            {firstTurn?.es && <span className="quiz-kind-option-description">{firstTurn.es}</span>}
          </button>
        )
      })}
    </div>
  )
}
