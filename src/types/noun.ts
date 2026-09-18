import type { LanguageCode } from './language'

export type GermanArticle = 'der' | 'die' | 'das'
export type PolishGender = 'masculine' | 'feminine' | 'neuter'

export interface NounTranslation {
  /** Znaczenie rzeczownika w języku ojczystym (forma liczby pojedynczej), np. "rzecz" */
  singular: string
  /** Tylko dla `de` — rodzajnik określony (l.mn. zawsze "die", więc nie ma osobnego pola). */
  article?: GermanArticle
  /** Tylko dla `pl` — polski nie ma rodzajników, więc niesiemy zamiast tego rodzaj gramatyczny. */
  gender?: PolishGender
}

export type NounArticle = 'el' | 'la'
export type NounPluralArticle = 'los' | 'las'

export interface NounSpanish {
  singular: string
  article: NounArticle
  plural: string
  /**
   * Rodzajnik l.mn., gdy nie da się go wyliczyć z `article`. Dotyczy rzeczowników żeńskich, które
   * w l.poj. przyjmują "el" ze względów fonetycznych (np. "el agua"), a w l.mn. zawsze "las", nigdy
   * "los". Brak pola = wylicz standardowo (el→los, la→las).
   */
  pluralArticle?: NounPluralArticle
}

/**
 * Wpis z public/vocabulary/nouns/metadata.json. Klucz `es` niesie hiszpańską formę
 * rzeczownika (z rodzajnikiem i liczbą mnogą); pozostałe klucze językowe (pl/en/de) niosą
 * tylko jego znaczenie (forma liczby pojedynczej w danym języku).
 */
export interface NounMetadataEntry extends Partial<Record<LanguageCode, NounTranslation>> {
  es: NounSpanish
}

/** public/vocabulary/nouns/metadata.json — jeden wspólny plik dla wszystkich rzeczowników. */
export interface NounMetadata {
  [id: string]: NounMetadataEntry
}

export interface Noun {
  id: string
  es: NounSpanish
  translations: Partial<Record<LanguageCode, NounTranslation>>
}
