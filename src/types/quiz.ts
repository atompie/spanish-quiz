import type { LanguageCode } from './language'
import type { Person, Pronoun, PronounType, TenseId, VerbType } from './grammar'

export type QuestionCount = 5 | 10 | 20
export type QuizMode = 'random' | 'mistakes'

/**
 * "phrase"      — odgadywanie całego przykładowego zdania (Verb.examples[]).
 * "conjugation" — odgadywanie gołej odmienionej formy czasownika (Verb.conjugations).
 */
export type QuizKind = 'phrase' | 'conjugation'

export interface QuizSettings {
  questionCount: QuestionCount
  enabledTenses: TenseId[]
  enabledPronounTypes: PronounType[]
  enabledVerbTypes: VerbType[]
  /** Używane tylko przez quiz "conjugation". */
  enabledPersons: Person[]
  mode: QuizMode
  kind: QuizKind
  /** Język ojczysty, w którym uczeń widzi UI i tłumaczenia. */
  language: LanguageCode
}

export interface QuizQuestion {
  /** Identyfikator pytania: `example.id` dla "phrase", `verbId:tense:person` dla "conjugation". */
  id: string
  kind: QuizKind
  verbId: string
  verbInfinitive: string
  /** Znaczenie bezokolicznika w języku ojczystym (dawniej `verbPolish`). */
  verbTranslation: string
  tense: TenseId
  person: Person
  /** Dla pytań "conjugation" zawsze 'none'/undefined. */
  pronounType: PronounType
  pronoun?: Pronoun
  /** Zdanie-prompt w języku ojczystym (dawniej `polish`). */
  promptTranslation: string
  correctAnswer: string
  /** Wszystkie akceptowane formy odpowiedzi (zawiera `correctAnswer` jako pierwszy element). */
  acceptedAnswers: string[]
}

export interface AnsweredQuestion {
  question: QuizQuestion
  userAnswer: string
  correct: boolean
}

export interface MistakeRecord {
  id: string
  verbId: string
  lastWrongAnswer: string
  timesWrong: number
  lastSeenAt: string
}

export interface QuizResultSummary {
  date: string
  correct: number
  incorrect: number
  total: number
}
