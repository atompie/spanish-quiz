import { SpeakerOffIcon } from '../common/SpeakerOffIcon'
import { SpeakerOnIcon } from '../common/SpeakerOnIcon'
import { TopBarCloseButton } from '../common/TopBarCloseButton'

interface DialogTopBarProps {
  nativeAudioEnabled: boolean
  onToggleNativeAudio: () => void
  toggleLabel: string
  enableLabel: string
  disableLabel: string
  closeLabel: string
  onClose: () => void
}

export function DialogTopBar({
  nativeAudioEnabled,
  onToggleNativeAudio,
  toggleLabel,
  enableLabel,
  disableLabel,
  closeLabel,
  onClose,
}: DialogTopBarProps) {
  const title = nativeAudioEnabled ? disableLabel : enableLabel

  return (
    <div className="dialog-topbar">
      <button
        type="button"
        className={`dialog-audio-toggle${nativeAudioEnabled ? ' dialog-audio-toggle--marked' : ''}`}
        aria-label={title}
        title={title}
        onClick={onToggleNativeAudio}
      >
        {nativeAudioEnabled ? <SpeakerOffIcon /> : <SpeakerOnIcon />}
        <span>{toggleLabel}</span>
      </button>
      <TopBarCloseButton label={closeLabel} onClose={onClose} />
    </div>
  )
}
