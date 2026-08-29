import type { Example, Verb } from '../types/verb'
import type { QuizQuestion, QuizSettings } from '../types/quiz'
import type { Person, TenseId, VerbType } from '../types/grammar'
import { PERSONS } from '../types/grammar'
import type { LanguageCode } from '../types/language'
import { PERSONS_META } from '../data/persons'
import { TENSES } from '../data/tenses'
import { getExampleTranslation, getLabel, getVerbTranslation } from './translation'

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function verbTypeOf(verb: Verb): VerbType {
  return verb.regular ? 'regular' : 'irregular'
}

// --- Quiz "phrase" (odgadywanie całego przykładowego zdania) ---

function toPhraseQuestion(verb: Verb, example: Example, language: LanguageCode): QuizQuestion {
  return {
    id: example.id,
    kind: 'phrase',
    verbId: verb.id,
    verbInfinitive: verb.infinitive,
    verbTranslation: getVerbTranslation(verb, language).meaning,
    tense: example.tense,
    person: example.person,
    pronounType: example.pronounType,
    pronoun: example.pronoun,
    promptTranslation: getExampleTranslation(example, language),
    correctAnswer: example.spanish,
    acceptedAnswers: [example.spanish, ...(example.alternativeAnswers ?? [])],
  }
}

function collectPhrasePool(verbs: Verb[]): { verb: Verb; example: Example }[] {
  const pool: { verb: Verb; example: Example }[] = []
  for (const verb of verbs) {
    for (const example of verb.examples) {
      pool.push({ verb, example })
    }
  }
  return pool
}

function matchesPhraseSettings(verb: Verb, example: Example, settings: QuizSettings): boolean {
  if (!settings.enabledVerbTypes.includes(verbTypeOf(verb))) return false
  if (!settings.enabledTenses.includes(example.tense)) return false
  if (example.pronounType !== 'none' && !settings.enabledPronounTypes.includes(example.pronounType)) return false
  return true
}

function generatePhraseQuestions(verbs: Verb[], settings: QuizSettings, mistakeIds?: Set<string>): QuizQuestion[] {
  const pool = collectPhrasePool(verbs).filter(({ verb, example }) => {
    if (settings.mode === 'mistakes' && (!mistakeIds || !mistakeIds.has(example.id))) {
      return false
    }
    return matchesPhraseSettings(verb, example, settings)
  })

  const shuffled = shuffle(pool)
  const selected = shuffled.slice(0, settings.questionCount)
  return selected.map(({ verb, example }) => toPhraseQuestion(verb, example, settings.language))
}

// --- Quiz "conjugation" (odgadywanie gołej odmienionej formy) ---

interface ConjugationPoolEntry {
  verb: Verb
  tense: TenseId
  person: Person
}

function conjugationQuestionId(verbId: string, tense: TenseId, person: Person): string {
  return `${verbId}:${tense}:${person}`
}

function personLabel(person: Person, language: LanguageCode): string {
  const meta = PERSONS_META.find((p) => p.id === person)
  return meta ? getLabel(meta, language) : person
}

function toConjugationQuestion(verb: Verb, tense: TenseId, person: Person, language: LanguageCode): QuizQuestion {
  const correctAnswer = verb.conjugations[tense][person]
  const translatedForm = getVerbTranslation(verb, language).conjugations[tense][person]
  return {
    id: conjugationQuestionId(verb.id, tense, person),
    kind: 'conjugation',
    verbId: verb.id,
    verbInfinitive: verb.infinitive,
    verbTranslation: getVerbTranslation(verb, language).meaning,
    tense,
    person,
    pronounType: 'none',
    pronoun: undefined,
    promptTranslation: `${personLabel(person, language)}: ${translatedForm}`,
    correctAnswer,
    acceptedAnswers: [correctAnswer],
  }
}

function collectConjugationPool(verbs: Verb[]): ConjugationPoolEntry[] {
  const pool: ConjugationPoolEntry[] = []
  for (const verb of verbs) {
    for (const tense of TENSES) {
      for (const person of PERSONS) {
        pool.push({ verb, tense: tense.id, person })
      }
    }
  }
  return pool
}

function matchesConjugationSettings(verb: Verb, tense: TenseId, person: Person, settings: QuizSettings): boolean {
  if (!settings.enabledVerbTypes.includes(verbTypeOf(verb))) return false
  if (!settings.enabledTenses.includes(tense)) return false
  if (!settings.enabledPersons.includes(person)) return false
  return true
}

function generateConjugationQuestions(
  verbs: Verb[],
  settings: QuizSettings,
  mistakeIds?: Set<string>,
): QuizQuestion[] {
  const pool = collectConjugationPool(verbs).filter(({ verb, tense, person }) => {
    if (settings.mode === 'mistakes') {
      const id = conjugationQuestionId(verb.id, tense, person)
      if (!mistakeIds || !mistakeIds.has(id)) return false
    }
    return matchesConjugationSettings(verb, tense, person, settings)
  })

  const shuffled = shuffle(pool)
  const selected = shuffled.slice(0, settings.questionCount)
  return selected.map(({ verb, tense, person }) => toConjugationQuestion(verb, tense, person, settings.language))
}

/**
 * Tryb "mistakes" zawęża pulę do wcześniej pomylonych pytań, ale nadal
 * respektuje wszystkie filtry z Ustawień (czasy, zaimki/osoby, typ czasownika).
 */
export function generateQuiz(verbs: Verb[], settings: QuizSettings, mistakeIds?: Set<string>): QuizQuestion[] {
  return settings.kind === 'conjugation'
    ? generateConjugationQuestions(verbs, settings, mistakeIds)
    : generatePhraseQuestions(verbs, settings, mistakeIds)
}
