import { DEFAULT_ENABLED_TENSES } from '../data/tenses'
import { DEFAULT_ENABLED_PRONOUN_TYPES } from '../data/pronouns'
import { DEFAULT_ENABLED_VERB_TYPES } from '../data/verbTypes'
import { DEFAULT_LANGUAGE } from '../data/languages'
import { PERSONS } from '../types/grammar'
import type { MistakeRecord, QuizResultSummary, QuizSettings } from '../types/quiz'
import type { Theme } from '../types/theme'

const KEYS = {
  settings: 'quiz.settings',
  mistakes: 'quiz.mistakes',
  history: 'quiz.history',
  theme: 'quiz.theme',
} as const

export const DEFAULT_THEME: Theme = 'system'

export const DEFAULT_SETTINGS: QuizSettings = {
  questionCount: 10,
  enabledTenses: DEFAULT_ENABLED_TENSES,
  enabledPronounTypes: DEFAULT_ENABLED_PRONOUN_TYPES,
  enabledVerbTypes: DEFAULT_ENABLED_VERB_TYPES,
  enabledPersons: PERSONS,
  mode: 'random',
  kind: 'phrase',
  language: DEFAULT_LANGUAGE,
  listeningAnswerWaitSeconds: 5,
  listeningSentenceCount: 5,
}

const MAX_HISTORY_ENTRIES = 50

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage niedostępny (np. tryb prywatny) — pomijamy zapis
  }
}

export function loadSettings(): QuizSettings {
  const loaded = readJson<Partial<QuizSettings>>(KEYS.settings, DEFAULT_SETTINGS)
  return { ...DEFAULT_SETTINGS, ...loaded }
}

export function saveSettings(settings: QuizSettings): void {
  writeJson(KEYS.settings, settings)
}

export function loadMistakes(): Record<string, MistakeRecord> {
  return readJson(KEYS.mistakes, {})
}

export function saveMistakes(mistakes: Record<string, MistakeRecord>): void {
  writeJson(KEYS.mistakes, mistakes)
}

export function recordMistake(id: string, verbId: string, wrongAnswer: string): void {
  const mistakes = loadMistakes()
  const existing = mistakes[id]
  mistakes[id] = {
    id,
    verbId,
    lastWrongAnswer: wrongAnswer,
    timesWrong: (existing?.timesWrong ?? 0) + 1,
    lastSeenAt: new Date().toISOString(),
  }
  saveMistakes(mistakes)
}

export function clearMistake(id: string): void {
  const mistakes = loadMistakes()
  if (id in mistakes) {
    delete mistakes[id]
    saveMistakes(mistakes)
  }
}

export function clearMistakes(): void {
  saveMistakes({})
}

export function loadTheme(): Theme {
  return readJson<Theme>(KEYS.theme, DEFAULT_THEME)
}

export function saveTheme(theme: Theme): void {
  writeJson(KEYS.theme, theme)
}

export function loadHistory(): QuizResultSummary[] {
  return readJson(KEYS.history, [])
}

export function appendHistory(entry: QuizResultSummary): void {
  const history = loadHistory()
  history.unshift(entry)
  writeJson(KEYS.history, history.slice(0, MAX_HISTORY_ENTRIES))
}
