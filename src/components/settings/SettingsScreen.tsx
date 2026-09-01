import { LANGUAGES } from '../../data/languages'
import { PERSONS_META } from '../../data/persons'
import { SELECTABLE_PRONOUN_TYPES } from '../../data/pronouns'
import { TENSES } from '../../data/tenses'
import { VERB_TYPES } from '../../data/verbTypes'
import { useTranslation } from '../../i18n/LanguageContext'
import { getLabel } from '../../lib/translation'
import type { useQuizSession } from '../../hooks/useQuizSession'
import type { PwaUpdateStatus } from '../../hooks/usePwaUpdate'
import type { Person, PronounType, TenseId, VerbType } from '../../types/grammar'
import type { QuestionCount, QuizMode } from '../../types/quiz'
import type { Theme } from '../../types/theme'

interface SettingsScreenProps {
  session: ReturnType<typeof useQuizSession>
  theme: Theme
  onThemeChange: (theme: Theme) => void
  updateStatus: PwaUpdateStatus
  onCheckForUpdate: () => void
}

const QUESTION_COUNTS: QuestionCount[] = [5, 10, 20]

function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

export function SettingsScreen({ session, theme, onThemeChange, updateStatus, onCheckForUpdate }: SettingsScreenProps) {
  const { t, language } = useTranslation()
  const { settings, updateSettings } = session
  const themeOptions: { id: Theme; label: string }[] = [
    { id: 'system', label: t.themeSystem },
    { id: 'light', label: t.themeLight },
    { id: 'dark', label: t.themeDark },
  ]

  function toggleTense(tense: TenseId) {
    updateSettings({ enabledTenses: toggleInArray(settings.enabledTenses, tense) })
  }

  function togglePronounType(type: PronounType) {
    updateSettings({ enabledPronounTypes: toggleInArray(settings.enabledPronounTypes, type) })
  }

  function togglePerson(person: Person) {
    updateSettings({ enabledPersons: toggleInArray(settings.enabledPersons, person) })
  }

  function toggleVerbType(type: VerbType) {
    updateSettings({ enabledVerbTypes: toggleInArray(settings.enabledVerbTypes, type) })
  }

  return (
    <>
      <div className="settings-section">
        <h2>{t.settingsQuestionCount}</h2>
        <div className="count-options">
          {QUESTION_COUNTS.map((count) => (
            <button
              key={count}
              type="button"
              className={settings.questionCount === count ? 'active' : ''}
              onClick={() => updateSettings({ questionCount: count })}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h2>{t.settingsTenses}</h2>
        {TENSES.map((tense) => (
          <label key={tense.id} className="option-row">
            <input
              type="checkbox"
              checked={settings.enabledTenses.includes(tense.id)}
              onChange={() => toggleTense(tense.id)}
            />
            <span>{getLabel(tense, language)}</span>
          </label>
        ))}
      </div>

      {settings.kind === 'phrase' && (
        <div className="settings-section">
          <h2>{t.settingsPronounTypes}</h2>
          {SELECTABLE_PRONOUN_TYPES.map((type) => (
            <label key={type.id} className="option-row">
              <input
                type="checkbox"
                checked={settings.enabledPronounTypes.includes(type.id)}
                onChange={() => togglePronounType(type.id)}
              />
              <span>{getLabel(type, language)}</span>
            </label>
          ))}
        </div>
      )}

      {settings.kind === 'conjugation' && (
        <div className="settings-section">
          <h2>{t.settingsPersons}</h2>
          {PERSONS_META.map((person) => (
            <label key={person.id} className="option-row">
              <input
                type="checkbox"
                checked={settings.enabledPersons.includes(person.id)}
                onChange={() => togglePerson(person.id)}
              />
              <span>{getLabel(person, language)}</span>
            </label>
          ))}
        </div>
      )}

      <div className="settings-section">
        <h2>{t.settingsVerbType}</h2>
        {VERB_TYPES.map((type) => (
          <label key={type.id} className="option-row">
            <input
              type="checkbox"
              checked={settings.enabledVerbTypes.includes(type.id)}
              onChange={() => toggleVerbType(type.id)}
            />
            <span>{getLabel(type, language)}</span>
          </label>
        ))}
      </div>

      <div className="settings-section">
        <h2>{t.settingsMode}</h2>
        {(
          [
            { id: 'random', label: t.settingsModeRandom },
            { id: 'mistakes', label: t.settingsModeMistakes },
          ] as { id: QuizMode; label: string }[]
        ).map((mode) => (
          <div key={mode.id} className="option-row" onClick={() => updateSettings({ mode: mode.id })}>
            <input
              type="radio"
              name="quiz-mode"
              checked={settings.mode === mode.id}
              onChange={() => updateSettings({ mode: mode.id })}
            />
            <label>{mode.label}</label>
          </div>
        ))}
      </div>

      <div className="settings-section">
        <h2>{t.settingsLanguage}</h2>
        <div className="count-options">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              className={settings.language === lang.id ? 'active' : ''}
              onClick={() => updateSettings({ language: lang.id })}
            >
              {lang.nameNative}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h2>{t.settingsTheme}</h2>
        <div className="count-options">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={theme === option.id ? 'active' : ''}
              onClick={() => onThemeChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h2>{t.settingsUpdate}</h2>
        <button type="button" className="btn btn-secondary" onClick={onCheckForUpdate}>
          {updateStatus === 'update-available' ? t.settingsUpdateApply : t.settingsUpdateCheck}
        </button>
        {updateStatus === 'checking' && <p>{t.settingsUpdateChecking}</p>}
        {updateStatus === 'up-to-date' && <p>{t.settingsUpdateUpToDate}</p>}
      </div>
    </>
  )
}
