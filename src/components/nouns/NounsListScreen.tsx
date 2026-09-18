import { useState } from 'react'
import { useNouns } from '../../hooks/useNouns'
import { useTranslation } from '../../i18n/LanguageContext'
import { getNounDisplayWord } from '../../lib/translation'

interface NounsListScreenProps {
  onSelect: (nounId: string) => void
}

export function NounsListScreen({ onSelect }: NounsListScreenProps) {
  const { t, language } = useTranslation()
  const { nouns, hasError } = useNouns()
  const [query, setQuery] = useState('')

  if (hasError) {
    return (
      <div className="empty-state">
        <p>{t.nounListLoadError}</p>
      </div>
    )
  }

  if (nouns === null) {
    return null
  }

  const trimmed = query.trim().toLowerCase()
  const filteredNouns = trimmed ? nouns.filter((n) => n.es.singular.toLowerCase().startsWith(trimmed)) : nouns

  return (
    <>
      <input
        type="search"
        className="verb-search-input"
        placeholder={t.nounSearchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {filteredNouns.length === 0 ? (
        <div className="empty-state">
          <p>{t.nounSearchEmpty}</p>
        </div>
      ) : (
        <ul className="verb-list">
          {filteredNouns.map((noun) => (
            <li key={noun.id}>
              <button type="button" className="verb-list-item" onClick={() => onSelect(noun.id)}>
                <strong>
                  {noun.es.article} {noun.es.singular}
                </strong>
                <span>{getNounDisplayWord(noun, language)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
