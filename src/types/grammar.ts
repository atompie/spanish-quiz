export type Person = 'yo' | 'tu' | 'el' | 'nosotros' | 'vosotros' | 'ellos'

export const PERSONS: Person[] = ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos']

export const PERSON_LABELS: Record<Person, string> = {
  yo: 'yo',
  tu: 'tú',
  el: 'él/ella',
  nosotros: 'nosotros',
  vosotros: 'vosotros',
  ellos: 'ellos/ellas',
}

/** Rozszerzalne w przyszłości o subjuntivo, imperativo itd. */
export type TenseId = 'presente' | 'preterite' | 'futuro' | 'ir_a_infinitivo' | 'acabar_de_infinitivo'

/**
 * "none"     — zdanie ćwiczy samą koniugację, bez zaimka dopełnienia
 * "direct"   — dopełnienie bliższe (me/te/lo/la/nos/os/los/las)
 * "indirect" — dopełnienie dalsze (me/te/le/nos/os/les)
 * W przyszłości: "reflexive", "double" (np. "se lo").
 */
export type PronounType = 'none' | 'direct' | 'indirect'

export type DirectPronoun = 'me' | 'te' | 'lo' | 'la' | 'nos' | 'os' | 'los' | 'las'
export type IndirectPronoun = 'me' | 'te' | 'le' | 'nos' | 'os' | 'les'
export type Pronoun = DirectPronoun | IndirectPronoun

export type VerbType = 'regular' | 'irregular'
