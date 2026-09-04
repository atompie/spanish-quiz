import { CloseIcon } from './CloseIcon'

interface TopBarCloseButtonProps {
  label: string
  onClose: () => void
}

export function TopBarCloseButton({ label, onClose }: TopBarCloseButtonProps) {
  return (
    <div className="quiz-topbar">
      <button type="button" className="btn-icon btn-icon--inverted" aria-label={label} title={label} onClick={onClose}>
        <CloseIcon />
      </button>
    </div>
  )
}
