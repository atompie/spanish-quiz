import { SettingsSection } from './SettingsSection'

export interface OptionButtonGroupOption<T extends string | number> {
  id: T
  label: string
}

interface OptionButtonGroupProps<T extends string | number> {
  title: string
  options: OptionButtonGroupOption<T>[]
  value: T
  onChange: (value: T) => void
}

export function OptionButtonGroup<T extends string | number>({
  title,
  options,
  value,
  onChange,
}: OptionButtonGroupProps<T>) {
  return (
    <SettingsSection title={title}>
      <div className="count-options">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={value === opt.id ? 'active' : ''}
            onClick={() => onChange(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </SettingsSection>
  )
}
