## Why

The listening course's pause/resume control is currently a full-width text button pinned to the bottom of the screen, disconnected from the other session controls (wait-time picker, stop) that already live in the top bar. Moving it into the top bar next to the stop/close icon consolidates session controls in one place and matches the icon-based interaction style already used there.

## What Changes

- Move the pause/resume control from the bottom `.listening-controls` button into the listening course's own top bar, as an icon button positioned to the left of the existing close/stop icon (right-hand side of the bar, after the wait-time picker).
- Convert the control from a text button (`t.listeningPause` / `t.listeningResume` label) to an icon-only button: a new pause icon while playing, the existing play icon while paused. Existing `t.listeningPause` / `t.listeningResume` strings are reused as `aria-label`/`title`, no new i18n needed.
- The pause icon is only shown in the active-session top bar (not the pre-start "idle" top bar), matching when the control is currently shown.
- Remove the now-empty `.listening-controls` wrapper and its dead CSS rule.
- The dialog (speaking) course is out of scope: its pause button stays a bottom text button, unchanged.
- **BREAKING**: none (purely a UI relocation; no behavior, storage, or session logic changes).

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `listening-lessons`: adds a requirement that the pause/resume control is presented as an icon in the listening course's top bar (next to the close/stop icon) during an active session, instead of as a bottom-of-screen text button.

## Impact

- `src/components/listening/ListeningPracticeScreen.tsx` — move the pause/resume button into the active-session top bar; remove the bottom `.listening-controls` block.
- New `src/components/common/PauseIcon.tsx` — icon component, mirroring the style of `PlayIcon`/`CloseIcon`/`RefreshIcon`.
- `src/index.css` — new small right-aligned action-group style to hold the pause icon and the existing close icon together in the top bar; remove the now-unused `.listening-controls` rule.
- No change to `useListeningSession`, `src/lib/listeningSession.ts`, `src/types/quiz.ts`, i18n translation files, or the dialog course.
