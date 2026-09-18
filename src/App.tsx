import { useEffect, useState } from 'react'
import { AppShell } from './components/layout/AppShell'
import type { Screen } from './components/layout/NavBar'
import { DialogPracticeScreen } from './components/dialog/DialogPracticeScreen'
import { ListeningPracticeScreen } from './components/listening/ListeningPracticeScreen'
import { QuizKindPicker } from './components/quiz/QuizKindPicker'
import { QuizScreen } from './components/quiz/QuizScreen'
import { SettingsScreen } from './components/settings/SettingsScreen'
import { VocabularyScreen } from './components/vocabulary/VocabularyScreen'
import type { VocabularyCategoryId } from './data/vocabularyCategories'
import { usePwaUpdate } from './hooks/usePwaUpdate'
import { useQuizSession } from './hooks/useQuizSession'
import { useTheme } from './hooks/useTheme'
import { LanguageProvider } from './i18n/LanguageContext'
import type { QuizKind } from './types/quiz'

function App() {
  const [screen, setScreen] = useState<Screen>('quiz')
  const [selectedVerbId, setSelectedVerbId] = useState<string | null>(null)
  const [vocabularyCategory, setVocabularyCategory] = useState<VocabularyCategoryId | null>(null)
  const [showQuizPicker, setShowQuizPicker] = useState(true)
  const session = useQuizSession()
  const { theme, setTheme } = useTheme()
  const pwaUpdate = usePwaUpdate()

  useEffect(() => {
    document.documentElement.lang = session.settings.language
  }, [session.settings.language])

  function handleScreenChange(next: Screen) {
    setScreen(next)
    setSelectedVerbId(null)
    if (next === 'quiz') setShowQuizPicker(true)
    if (next === 'vocabulary') setVocabularyCategory(null)
  }

  function handleVocabularyBack() {
    setVocabularyCategory(null)
    setSelectedVerbId(null)
  }

  function handlePickQuizKind(kind: QuizKind) {
    session.updateSettings({ kind })
    setShowQuizPicker(false)
  }

  return (
    <LanguageProvider language={session.settings.language}>
      <AppShell screen={screen} onScreenChange={handleScreenChange}>
        {screen === 'quiz' &&
          (showQuizPicker ? (
            <QuizKindPicker onSelect={handlePickQuizKind} />
          ) : session.settings.kind === 'listening' ? (
            <ListeningPracticeScreen
              nativeLanguage={session.settings.language}
              answerWaitSeconds={session.settings.listeningAnswerWaitSeconds}
              onAnswerWaitSecondsChange={(seconds) => session.updateSettings({ listeningAnswerWaitSeconds: seconds })}
            />
          ) : session.settings.kind === 'dialog' ? (
            <DialogPracticeScreen nativeLanguage={session.settings.language} />
          ) : (
            <QuizScreen session={session} />
          ))}
        {screen === 'vocabulary' && (
          <VocabularyScreen
            selectedCategory={vocabularyCategory}
            onSelectCategory={setVocabularyCategory}
            onBack={handleVocabularyBack}
            selectedVerbId={selectedVerbId}
            onSelectVerb={setSelectedVerbId}
            onCloseVerbExplanation={() => setSelectedVerbId(null)}
          />
        )}
        {screen === 'settings' && (
          <SettingsScreen
            session={session}
            theme={theme}
            onThemeChange={setTheme}
            updateStatus={pwaUpdate.status}
            onCheckForUpdate={pwaUpdate.checkForUpdate}
          />
        )}
      </AppShell>
    </LanguageProvider>
  )
}

export default App
