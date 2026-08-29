export interface CheckOptions {
  /** Domyślnie true — akcenty (á/a, é/e...) nie mają znaczenia, bo nie każda klawiatura ma znaki hiszpańskie. Ustaw false dla trybu ścisłego. */
  ignoreAccents?: boolean
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function isAnswerCorrect(userAnswer: string, correctAnswer: string, options?: CheckOptions): boolean {
  const normalizedUser = normalize(userAnswer)
  const normalizedCorrect = normalize(correctAnswer)
  const ignoreAccents = options?.ignoreAccents ?? true

  if (ignoreAccents) {
    return stripAccents(normalizedUser) === stripAccents(normalizedCorrect)
  }

  return normalizedUser === normalizedCorrect
}

export function isAnyAnswerCorrect(userAnswer: string, acceptedAnswers: string[], options?: CheckOptions): boolean {
  return acceptedAnswers.some((answer) => isAnswerCorrect(userAnswer, answer, options))
}
