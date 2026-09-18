import { useNouns } from '../../hooks/useNouns'
import { useTranslation } from '../../i18n/LanguageContext'
import { getNounDisplayWord, getNounGenderLabel } from '../../lib/translation'
import type { NounSpanish } from '../../types/noun'
import { Modal } from '../common/Modal'

interface NounExplanationModalProps {
  nounId: string
  onClose: () => void
}

function pluralArticle(es: NounSpanish): 'los' | 'las' {
  return es.pluralArticle ?? (es.article === 'la' ? 'las' : 'los')
}

export function NounExplanationModal({ nounId, onClose }: NounExplanationModalProps) {
  const { t, language } = useTranslation()
  const { nouns } = useNouns()
  const noun = nouns?.find((n) => n.id === nounId)

  if (!noun) return null

  const genderLabel = getNounGenderLabel(noun, language)

  return (
    <Modal onClose={onClose} variant="fullscreen">
      <p className="modal-verb">
        {noun.es.article} {noun.es.singular}
      </p>
      <p className="modal-meaning">
        {t.explanationPlural} <strong>{pluralArticle(noun.es)} {noun.es.plural}</strong>
      </p>
      <p className="modal-meaning">= {getNounDisplayWord(noun, language)}</p>
      {genderLabel && <p className="modal-meaning">{genderLabel}</p>}
    </Modal>
  )
}
