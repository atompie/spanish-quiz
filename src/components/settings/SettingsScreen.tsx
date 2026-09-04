import { LANGUAGES } from '../../data/languages'
import { PERSONS_META } from '../../data/persons'
import { SELECTABLE_PRONOUN_TYPES } from '../../data/pronouns'
import { TENSES } from '../../data/tenses'
import { VERB_TYPES } from '../../data/verbTypes'
import { useTranslation } from '../../i18n/LanguageContext'
import { getLabel } from '../../lib/translation'
import type { useQuizSession } from '../../hooks/useQuizSession'
import type { PwaUpdateStatus } from '../../hooks/usePwaUpdate'
import type { PronounType } from '../../types/grammar'
import type { ListeningAnswerWaitSeconds, ListeningSentenceCount, QuestionCount, QuizMode } from '../../types/quiz'
import type { Theme } from '../../types/theme'
import { CheckboxOptionList } from '../common/CheckboxOptionList'
import { OptionButtonGroup } from '../common/OptionButtonGroup'
import { SettingsSection } from '../common/SettingsSection'

interface SettingsScreenProps {
  session: ReturnType<typeof useQuizSession>
  theme: Theme
  onThemeChange: (theme: Theme) => void
  updateStatus: PwaUpdateStatus
  onCheckForUpdate: () => void
}

const QUESTION_COUNTS: QuestionCount[] = [5, 10, 20]
const LISTENING_ANSWER_WAIT_OPTIONS: ListeningAnswerWaitSeconds[] = [3, 5, 10]
const LISTENING_SENTENCE_COUNTS: ListeningSentenceCount[] = [5, 10, 20]

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

  function togglePronounType(type: PronounType) {
    updateSettings({ enabledPronounTypes: toggleInArray(settings.enabledPronounTypes, type) })
  }

  return (
    <>
      <OptionButtonGroup
        title={t.settingsQuestionCount}
        options={QUESTION_COUNTS.map((count) => ({ id: count, label: String(count) }))}
        value={settings.questionCount}
        onChange={(count) => updateSettings({ questionCount: count })}
      />

      <CheckboxOptionList
        title={t.settingsTenses}
        options={TENSES.map((tense) => ({ id: tense.id, label: getLabel(tense, language) }))}
        selected={settings.enabledTenses}
        onToggle={(tense) => updateSettings({ enabledTenses: toggleInArray(settings.enabledTenses, tense) })}
      />

      {settings.kind === 'phrase' && (
        <CheckboxOptionList
          title={t.settingsPronounTypes}
          options={SELECTABLE_PRONOUN_TYPES.map((type) => ({ id: type.id, label: getLabel(type, language) }))}
          selected={settings.enabledPronounTypes}
          onToggle={togglePronounType}
        />
      )}

      {settings.kind === 'conjugation' && (
        <CheckboxOptionList
          title={t.settingsPersons}
          options={PERSONS_META.map((person) => ({ id: person.id, label: getLabel(person, language) }))}
          selected={settings.enabledPersons}
          onToggle={(person) => updateSettings({ enabledPersons: toggleInArray(settings.enabledPersons, person) })}
        />
      )}

      {settings.kind === 'listening' && (
        <OptionButtonGroup
          title={t.settingsListeningWaitTime}
          options={LISTENING_ANSWER_WAIT_OPTIONS.map((seconds) => ({ id: seconds, label: `${seconds} s` }))}
          value={settings.listeningAnswerWaitSeconds}
          onChange={(seconds) => updateSettings({ listeningAnswerWaitSeconds: seconds })}
        />
      )}

      {settings.kind === 'listening' && (
        <OptionButtonGroup
          title={t.settingsListeningSentenceCount}
          options={LISTENING_SENTENCE_COUNTS.map((count) => ({ id: count, label: String(count) }))}
          value={settings.listeningSentenceCount}
          onChange={(count) => updateSettings({ listeningSentenceCount: count })}
        />
      )}

      <CheckboxOptionList
        title={t.settingsVerbType}
        options={VERB_TYPES.map((type) => ({ id: type.id, label: getLabel(type, language) }))}
        selected={settings.enabledVerbTypes}
        onToggle={(type) => updateSettings({ enabledVerbTypes: toggleInArray(settings.enabledVerbTypes, type) })}
      />

      <SettingsSection title={t.settingsMode}>
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
      </SettingsSection>

      <OptionButtonGroup
        title={t.settingsLanguage}
        options={LANGUAGES.map((lang) => ({ id: lang.id, label: lang.nameNative }))}
        value={settings.language}
        onChange={(id) => updateSettings({ language: id })}
      />

      <OptionButtonGroup title={t.settingsTheme} options={themeOptions} value={theme} onChange={onThemeChange} />

      <SettingsSection title={t.settingsUpdate}>
        <button type="button" className="btn btn-secondary" onClick={onCheckForUpdate}>
          {updateStatus === 'update-available' ? t.settingsUpdateApply : t.settingsUpdateCheck}
        </button>
        {updateStatus === 'checking' && <p>{t.settingsUpdateChecking}</p>}
        {updateStatus === 'up-to-date' && <p>{t.settingsUpdateUpToDate}</p>}
      </SettingsSection>
    </>
  )
}
