import type { Conjugations } from '../types/verb'
import type { TenseId } from '../types/grammar'

type RegularEnding = 'ar' | 'er' | 'ir'

const PRESENT_ENDINGS: Record<RegularEnding, string[]> = {
  ar: ['o', 'as', 'a', 'amos', 'áis', 'an'],
  er: ['o', 'es', 'e', 'emos', 'éis', 'en'],
  ir: ['o', 'es', 'e', 'imos', 'ís', 'en'],
}

const PRETERITE_ENDINGS: Record<RegularEnding, string[]> = {
  ar: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],
  er: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
  ir: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
}

const FUTURE_ENDINGS = ['é', 'ás', 'á', 'emos', 'éis', 'án']
const IR_A_PREFIXES = ['voy a', 'vas a', 'va a', 'vamos a', 'vais a', 'van a']
const ACABAR_DE_PREFIXES = ['acabo de', 'acabas de', 'acaba de', 'acabamos de', 'acabáis de', 'acaban de']

function toConjugations(forms: string[]): Conjugations {
  const [yo, tu, el, nosotros, vosotros, ellos] = forms
  return { yo, tu, el, nosotros, vosotros, ellos }
}

/**
 * Wyprowadza pełną odmianę (5 czasów × 6 osób) czasownika w pełni regularnego
 * z samego bezokolicznika, wg standardowych końcówek -ar/-er/-ir. Nie obsługuje
 * czasowników z jakąkolwiek zmianą ortograficzną czy rdzenną (np. e→ie) —
 * takie przypadki mimo `regular: true` w tabelach gramatycznych wpisuje się
 * ręcznie jak dotąd.
 */
export function conjugateRegular(infinitive: string): Record<TenseId, Conjugations> {
  const ending = infinitive.slice(-2) as RegularEnding
  if (ending !== 'ar' && ending !== 'er' && ending !== 'ir') {
    throw new Error(`conjugateRegular: "${infinitive}" nie kończy się na -ar/-er/-ir`)
  }
  const stem = infinitive.slice(0, -2)

  return {
    presente: toConjugations(PRESENT_ENDINGS[ending].map((suffix) => stem + suffix)),
    preterite: toConjugations(PRETERITE_ENDINGS[ending].map((suffix) => stem + suffix)),
    futuro: toConjugations(FUTURE_ENDINGS.map((suffix) => infinitive + suffix)),
    ir_a_infinitivo: toConjugations(IR_A_PREFIXES.map((prefix) => `${prefix} ${infinitive}`)),
    acabar_de_infinitivo: toConjugations(ACABAR_DE_PREFIXES.map((prefix) => `${prefix} ${infinitive}`)),
  }
}
