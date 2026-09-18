import { useTranslation } from '../../i18n/LanguageContext'
import { QuizIcon, SettingsIcon, VerbsIcon } from './NavIcons'

export type Screen = 'quiz' | 'vocabulary' | 'settings'

interface NavBarProps {
  current: Screen
  onChange: (screen: Screen) => void
}

export function NavBar({ current, onChange }: NavBarProps) {
  const { t } = useTranslation()
  const tabs: { id: Screen; label: string; Icon: typeof QuizIcon }[] = [
    { id: 'quiz', label: t.navQuiz, Icon: QuizIcon },
    { id: 'vocabulary', label: t.navVocabulary, Icon: VerbsIcon },
    { id: 'settings', label: t.navSettings, Icon: SettingsIcon },
  ]
  return (
    <nav className="nav-bar">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={id === current ? 'active' : ''}
          onClick={() => onChange(id)}
        >
          <Icon className="nav-bar-icon" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
