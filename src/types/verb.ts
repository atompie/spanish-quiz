import type { LanguageCode } from './language'
import type { Person, PronounType, Pronoun, TenseId } from './grammar'

/**
 * Jedno ręcznie przygotowane, naturalne zdanie ćwiczebne przypisane do czasownika.
 * Quiz losuje z puli tych przykładów — nigdy nie składa zdań mechanicznie.
 */
export interface Example {
  id: string
  tense: TenseId
  person: Person
  pronounType: PronounType
  pronoun?: Pronoun
  /**
   * Zdanie w języku ojczystym pokazywane użytkownikowi, kluczowane po języku,
   * np. `{ pl: 'Widzę go.' }`. `Partial`, bo nie każdy język musi mieć
   * tłumaczenie każdego przykładu — odczyt zawsze przez getExampleTranslation().
   */
  translations: Partial<Record<LanguageCode, string>>
  /** Poprawna odpowiedź referencyjna, np. "lo veo" */
  spanish: string
  /** Dodatkowe, równie poprawne warianty odpowiedzi (opcjonalne), np. ['lo creo'] dla "creo eso". */
  alternativeAnswers?: string[]
}

export type Conjugations = Record<Person, string>

/** Wszystko, co zależy od języka ojczystego ucznia. */
export interface VerbTranslation {
  /** Znaczenie bezokolicznika w języku ojczystym, np. "być" */
  meaning: string
  conjugations: Record<TenseId, Conjugations>
}

export interface Verb {
  id: string
  infinitive: string
  regular: boolean
  /** Imiesłów bierny (participio pasado), np. "hablado", "hecho". */
  participle: string
  conjugations: Record<TenseId, Conjugations>
  /** Kluczowane po języku; `Partial` — patrz Example.translations. */
  translations: Partial<Record<LanguageCode, VerbTranslation>>
  examples: Example[]
}
