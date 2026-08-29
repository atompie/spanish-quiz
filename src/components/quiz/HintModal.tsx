import { useTranslation } from '../../i18n/LanguageContext'
import { Modal } from '../common/Modal'

interface HintModalProps {
  infinitive: string
  translation: string
  onClose: () => void
}

export function HintModal({ infinitive, translation, onClose }: HintModalProps) {
  const { t } = useTranslation()
  return (
    <Modal onClose={onClose}>
      <p className="modal-verb">{infinitive}</p>
      <p className="modal-meaning">= {translation}</p>
      <button type="button" className="btn btn-secondary" onClick={onClose}>
        {t.commonClose}
      </button>
    </Modal>
  )
}
