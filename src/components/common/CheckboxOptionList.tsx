import { SettingsSection } from './SettingsSection'

export interface CheckboxOptionListOption<T extends string> {
  id: T
  label: string
}

interface CheckboxOptionListProps<T extends string> {
  title: string
  options: CheckboxOptionListOption<T>[]
  selected: T[]
  onToggle: (id: T) => void
}

export function CheckboxOptionList<T extends string>({
  title,
  options,
  selected,
  onToggle,
}: CheckboxOptionListProps<T>) {
  return (
    <SettingsSection title={title}>
      {options.map((opt) => (
        <label key={opt.id} className="option-row">
          <input type="checkbox" checked={selected.includes(opt.id)} onChange={() => onToggle(opt.id)} />
          <span>{opt.label}</span>
        </label>
      ))}
    </SettingsSection>
  )
}
