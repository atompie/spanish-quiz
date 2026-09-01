import type { ReactNode } from 'react'
import { useTranslation } from '../../i18n/LanguageContext'
import { CloseIcon } from './CloseIcon'

interface ModalProps {
  onClose: () => void
  children: ReactNode
  variant?: 'card' | 'fullscreen'
}

export function Modal({ onClose, children, variant = 'card' }: ModalProps) {
  const { t } = useTranslation()
  const fullscreen = variant === 'fullscreen'
  return (
    <div className={`modal-overlay${fullscreen ? ' modal-overlay--fullscreen' : ''}`} onClick={onClose}>
      <div
        className={`modal-card${fullscreen ? ' modal-card--fullscreen' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {fullscreen && (
          <button
            type="button"
            className="btn-icon btn-icon--inverted modal-close"
            onClick={onClose}
            aria-label={t.commonClose}
          >
            <CloseIcon />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
