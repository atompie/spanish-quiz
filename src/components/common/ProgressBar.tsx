interface ProgressBarProps {
  current: number
  total: number
  centerLabel?: string
}

export function ProgressBar({ current, total, centerLabel }: ProgressBarProps) {
  const percent = total > 0 ? Math.min(100, (current / total) * 100) : 0

  return (
    <div className="progress-bar-row">
      <span className="progress-bar-count">{current}</span>
      <div className="progress-bar" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
        {centerLabel && <span className="progress-bar-center-label">{centerLabel}</span>}
      </div>
      <span className="progress-bar-count">{total}</span>
    </div>
  )
}
