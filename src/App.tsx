import { useEffect, useState } from 'react'
import { AppShell } from './components/layout/AppShell'
import type { Screen } from './components/layout/NavBar'
import { ExplanationModal } from './components/common/ExplanationModal'
import { QuizKindPicker } from './components/quiz/QuizKindPicker'
import { QuizScreen } from './components/quiz/QuizScreen'
import { SettingsScreen } from './components/settings/SettingsScreen'
import { VerbsListScreen } from './components/verbs/VerbsListScreen'
import { usePwaUpdate } from './hooks/usePwaUpdate'
import { useQuizSession } from './hooks/useQuizSession'
import { useTheme } from './hooks/useTheme'
import { LanguageProvider } from './i18n/LanguageContext'
import type { QuizKind } from './types/quiz'

function App() {
  const [screen, setScreen] = useState<Screen>('quiz')
  const [selectedVerbId, setSelectedVerbId] = useState<string | null>(null)
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
          ) : (
            <QuizScreen session={session} />
          ))}
        {screen === 'verbs' && (
          <>
            <VerbsListScreen onSelect={setSelectedVerbId} />
            {selectedVerbId && (
              <ExplanationModal verbId={selectedVerbId} onClose={() => setSelectedVerbId(null)} />
            )}
          </>
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
