import { VERBS } from '../src/data/verbs'
import { TENSES } from '../src/data/tenses'
import { LANGUAGES } from '../src/data/languages'
import { PERSONS } from '../src/types/grammar'

/**
 * Sprawdza kompletność każdego wpisu w VERBS bez uruchamiania aplikacji —
 * uruchom po dodaniu/edycji czasownika w src/data/verbs.ts (npm run validate:verbs).
 */

const errors: string[] = []
const seenVerbIds = new Set<string>()
const seenExampleIds = new Set<string>()

for (const verb of VERBS) {
  const label = `${verb.id} (${verb.infinitive})`

  if (seenVerbIds.has(verb.id)) {
    errors.push(`${label}: zduplikowane id czasownika`)
  }
  seenVerbIds.add(verb.id)

  for (const tense of TENSES) {
    const conjugation = verb.conjugations[tense.id]
    if (!conjugation) {
      errors.push(`${label}: brak odmiany dla czasu "${tense.id}"`)
      continue
    }
    for (const person of PERSONS) {
      if (!conjugation[person]) {
        errors.push(`${label}: brak formy "${person}" w czasie "${tense.id}"`)
      }
    }
  }

  for (const language of LANGUAGES) {
    const translation = verb.translations[language.id]
    if (!translation) {
      errors.push(`${label}: brak tłumaczenia dla języka "${language.id}"`)
      continue
    }
    if (!translation.meaning) {
      errors.push(`${label}: puste znaczenie ("meaning") dla języka "${language.id}"`)
    }
    for (const tense of TENSES) {
      const conjugation = translation.conjugations[tense.id]
      if (!conjugation) {
        errors.push(`${label}: brak tłumaczonej odmiany dla czasu "${tense.id}" (${language.id})`)
        continue
      }
      for (const person of PERSONS) {
        if (!conjugation[person]) {
          errors.push(`${label}: brak przetłumaczonej formy "${person}" w czasie "${tense.id}" (${language.id})`)
        }
      }
    }
  }

  if (verb.examples.length === 0) {
    errors.push(`${label}: brak przykładów zdań`)
  }

  for (const example of verb.examples) {
    if (seenExampleIds.has(example.id)) {
      errors.push(`${label}: zduplikowane id przykładu "${example.id}"`)
    }
    seenExampleIds.add(example.id)

    if (!example.spanish) {
      errors.push(`${label}: przykład "${example.id}" nie ma zdania po hiszpańsku`)
    }
    if (Object.keys(example.translations).length === 0) {
      errors.push(`${label}: przykład "${example.id}" nie ma żadnego tłumaczenia`)
    }

    if (example.alternativeAnswers) {
      const seenAlternatives = new Set<string>()
      for (const alternative of example.alternativeAnswers) {
        if (!alternative) {
          errors.push(`${label}: przykład "${example.id}" ma pusty wariant w "alternativeAnswers"`)
          continue
        }
        if (alternative === example.spanish) {
          errors.push(`${label}: przykład "${example.id}" ma w "alternativeAnswers" duplikat głównej odpowiedzi "${alternative}"`)
        }
        if (seenAlternatives.has(alternative)) {
          errors.push(`${label}: przykład "${example.id}" ma zduplikowany wariant "${alternative}" w "alternativeAnswers"`)
        }
        seenAlternatives.add(alternative)
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`Znaleziono ${errors.length} problem(ów) w src/data/verbs.ts:\n`)
  for (const error of errors) {
    console.error(`  - ${error}`)
  }
  process.exit(1)
}

console.log(`OK — ${VERBS.length} czasowników, wszystkie wpisy kompletne.`)
