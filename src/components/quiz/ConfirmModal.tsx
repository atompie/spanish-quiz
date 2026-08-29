import { Modal } from '../common/Modal'

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <Modal onClose={onCancel}>
      <p className="modal-title">{title}</p>
      <p className="modal-message">{message}</p>
      <div className="results-actions">
        <button type="button" className="btn btn-secondary" onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button type="button" className="btn btn-primary" onClick={onCancel}>
          {cancelLabel}
        </button>
      </div>
    </Modal>
  )
}
