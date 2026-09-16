## Why

The listening course's answer-wait time (3 / 5 / 10 seconds) is currently a global setting, but it only lives on the standalone Settings screen, one tap away from the lesson list and never visible while a lesson is running. A learner who wants to shorten or lengthen the wait has to leave the course, guess at the effect, and come back. Moving the control into the course's own top bar lets them see and change it right where it matters, including mid-lesson.

## What Changes

- Remove the "listening answer wait time" control (`settings.kind === 'listening'` block) from `SettingsScreen.tsx`.
- Add a 3 | 5 | 10 icon-style segmented control to the left side of the listening course's top bar (`ListeningPracticeScreen`), mirroring the left-icon / right-close layout already used by the dialog course's top bar.
- Show the control both in the pre-start ("idle") top bar and in the active-session top bar, so the wait time can be changed before or during a lesson.
- Selecting a value continues to update the existing global `listeningAnswerWaitSeconds` setting (already shared storage, not per-course), so the change takes effect immediately for the lesson-duration estimate and the running session's countdown.
- The dialog (speaking) course is explicitly out of scope: it keeps computing its pauses from audio duration / word count, unaffected by this setting, per product decision.
- **BREAKING**: none (purely a UI relocation; no stored setting is renamed or removed).

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `listening-lessons`: adds a requirement that the answer-wait-time control is presented inside the listening course's own top bar (available before and during a session) instead of on the separate Settings screen.

## Impact

- `src/components/settings/SettingsScreen.tsx` — remove the listening wait-time `OptionButtonGroup` block (and its now-unused import of `ListeningAnswerWaitSeconds`).
- `src/components/listening/ListeningPracticeScreen.tsx` — render the new wait-time control in both top-bar states; wire its `onChange` to `updateSettings`.
- New small presentational component for the 3 | 5 | 10 icon control (exact location decided in design.md).
- `src/App.tsx` — thread `session.updateSettings` (or a narrower callback) into `ListeningPracticeScreen`.
- `src/i18n/translations/*.ts` — retire the Settings-screen label string(s) for this control if they become unused there, add any new label/aria-text needed for the top-bar control.
- `src/index.css` — new styles for the top-bar wait-time control.
- No change to `src/lib/storage.ts`, `src/types/quiz.ts`, or `useListeningSession` — the underlying setting and its plumbing are reused as-is.
