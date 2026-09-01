import { useState } from 'react'
import { TENSES } from '../../data/tenses'
import { SELECTABLE_PRONOUN_TYPES } from '../../data/pronouns'
import { VERBS } from '../../data/verbs'
import { useTranslation } from '../../i18n/LanguageContext'
import { getLabel, getVerbTranslation } from '../../lib/translation'
import { PERSON_LABELS, PERSONS } from '../../types/grammar'
import type { Person, Pronoun, PronounType, TenseId } from '../../types/grammar'
import { Modal } from './Modal'

interface ExplanationModalProps {
  verbId: string
  tense?: TenseId
  person?: Person
  pronounType?: PronounType
  pronoun?: Pronoun
  onClose: () => void
}

export function ExplanationModal({ verbId, tense, person, pronounType, pronoun, onClose }: ExplanationModalProps) {
  const { t, language } = useTranslation()
  const verb = VERBS.find((v) => v.id === verbId)
  const [selectedTense, setSelectedTense] = useState<TenseId>(tense ?? TENSES[0].id)
  const tenseIndex = TENSES.findIndex((t) => t.id === selectedTense)
  const tenseMeta = TENSES[tenseIndex]

  if (!verb || !tenseMeta) return null

  const canGoPrev = tenseIndex > 0
  const canGoNext = tenseIndex < TENSES.length - 1
  const verbTranslation = getVerbTranslation(verb, language)
  const pronounTypeMeta = SELECTABLE_PRONOUN_TYPES.find((p) => p.id === pronounType)

  return (
    <Modal onClose={onClose} variant="fullscreen">
      <p className="modal-verb">{verb.infinitive}</p>
      <p className="modal-meaning">
        {t.explanationParticiple} <strong>{verb.participle}</strong>
      </p>
      <p className="modal-meaning">= {verbTranslation.meaning}</p>
      <p className="modal-meaning">
        <span className="regularity-badge">{verb.regular ? t.verbRegular : t.verbIrregular}</span>
      </p>

      {pronounType && pronounType !== 'none' && pronoun && pronounTypeMeta && (
        <p className="modal-meaning">
          {t.explanationPronoun} <strong>{pronoun}</strong> — {getLabel(pronounTypeMeta, language)}
        </p>
      )}

      <div className="tense-block">
        <div className="tense-nav">
          <button
            type="button"
            className="btn-icon btn-icon--sm tense-nav-arrow"
            onClick={() => setSelectedTense(TENSES[tenseIndex - 1].id)}
            disabled={!canGoPrev}
            aria-label={t.explanationPrevTense}
          >
            ‹
          </button>
          <h2>{getLabel(tenseMeta, language)}</h2>
          <button
            type="button"
            className="btn-icon btn-icon--sm tense-nav-arrow"
            onClick={() => setSelectedTense(TENSES[tenseIndex + 1].id)}
            disabled={!canGoNext}
            aria-label={t.explanationNextTense}
          >
            ›
          </button>
        </div>
        <table className="conjugation-table">
          <tbody>
            {PERSONS.map((p) => (
              <tr key={p} className={person && p === person ? 'highlight' : ''}>
                <td>{PERSON_LABELS[p]}</td>
                <td>{verb.conjugations[selectedTense][p]}</td>
                <td>{verbTranslation.conjugations[selectedTense][p]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  )
}
