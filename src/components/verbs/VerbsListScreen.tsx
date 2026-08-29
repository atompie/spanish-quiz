import { useState } from 'react'
import { VERBS } from '../../data/verbs'
import { useTranslation } from '../../i18n/LanguageContext'
import { getVerbTranslation } from '../../lib/translation'

interface VerbsListScreenProps {
  onSelect: (verbId: string) => void
}

export function VerbsListScreen({ onSelect }: VerbsListScreenProps) {
  const { t, language } = useTranslation()
  const [query, setQuery] = useState('')

  const trimmed = query.trim().toLowerCase()
  const filteredVerbs = trimmed ? VERBS.filter((v) => v.infinitive.toLowerCase().startsWith(trimmed)) : VERBS

  return (
    <>
      <input
        type="search"
        className="verb-search-input"
        placeholder={t.verbSearchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {filteredVerbs.length === 0 ? (
        <div className="empty-state">
          <p>{t.verbSearchEmpty}</p>
        </div>
      ) : (
        <ul className="verb-list">
          {filteredVerbs.map((verb) => (
            <li key={verb.id}>
              <button type="button" className="verb-list-item" onClick={() => onSelect(verb.id)}>
                <strong>{verb.infinitive}</strong>
                <span>{getVerbTranslation(verb, language).meaning}</span>
                <span className="regularity-badge">{verb.regular ? t.verbRegular : t.verbIrregular}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
