import { useTranslation } from '../../i18n/LanguageContext'
import { Modal } from '../common/Modal'

interface HintModalProps {
  infinitive: string
  translation: string
  regular: boolean
  onClose: () => void
}

export function HintModal({ infinitive, translation, regular, onClose }: HintModalProps) {
  const { t } = useTranslation()
  return (
    <Modal onClose={onClose} variant="fullscreen">
      <p className="modal-verb">{infinitive}</p>
      <p className="modal-meaning">= {translation}</p>
      <p className="modal-meaning">
        <span className="regularity-badge">{regular ? t.verbRegular : t.verbIrregular}</span>
      </p>
    </Modal>
  )
}
