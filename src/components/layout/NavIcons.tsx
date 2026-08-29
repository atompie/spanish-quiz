type IconProps = { className?: string }

const commonProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  width: 22,
  height: 22,
}

export function QuizIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.2 9.5a2.8 2.8 0 0 1 5.4 1c0 1.6-2.4 1.8-2.4 3.4" />
      <circle cx="12" cy="16.7" r="0.15" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function VerbsIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className}>
      <path d="M4 4.5c2.2-1 5-1 8 0v15c-3-1-5.8-1-8 0z" />
      <path d="M20 4.5c-2.2-1-5-1-8 0v15c3-1 5.8-1 8 0z" />
    </svg>
  )
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="8" strokeDasharray="1.5 3.2" />
    </svg>
  )
}
