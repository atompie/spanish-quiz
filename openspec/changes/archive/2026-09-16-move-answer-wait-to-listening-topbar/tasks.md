## 1. Remove the control from Settings

- [x] 1.1 In `src/components/settings/SettingsScreen.tsx`, remove the `settings.kind === 'listening'` `OptionButtonGroup` block (lines ~79-86), the now-unused `LISTENING_ANSWER_WAIT_OPTIONS` constant, and the now-unused `ListeningAnswerWaitSeconds` import. Verify `npm run build` (tsc) reports no unused-import errors and the Settings screen no longer renders any listening-wait-time control.

## 2. Build the top-bar wait-time control

- [x] 2.1 Create a new presentational component (e.g. `src/components/listening/AnswerWaitPicker.tsx`) that renders three icon buttons labeled "3", "5", "10", takes `value: ListeningAnswerWaitSeconds` and `onChange: (seconds: ListeningAnswerWaitSeconds) => void`, and marks the active value (e.g. `aria-pressed`/active class) matching the existing icon-button visual language (`btn-icon`) used elsewhere in top bars. Verify it renders standalone with each button clickable and calling `onChange` with the corresponding value.
- [x] 2.2 Add CSS for the new control in `src/index.css` (a left-aligned pill/segmented group sized to sit next to the existing `.quiz-topbar` close button), reusing the `.dialog-topbar` `space-between` layout pattern for the wrapping row. Verify visually at both mobile (~400px) and desktop widths.
- [x] 2.3 Add any new i18n strings the control needs (e.g. aria-labels/tooltips per option) to `src/i18n/types.ts` and all translation files (`de.ts`, `en.ts`, `pl.ts`). Verify TypeScript compiles (missing keys in any locale fail the `TranslationKeys` type). — no new keys were needed: the existing `settingsListeningWaitTime` string (present in `de`/`en`/`pl`) is reused as the control's `aria-label`/tooltip.

## 3. Wire the control into the listening course

- [x] 3.1 In `src/App.tsx`, pass a change handler for the wait-time setting (e.g. `onAnswerWaitSecondsChange={(seconds) => session.updateSettings({ listeningAnswerWaitSeconds: seconds })}`) into `ListeningPracticeScreen`. Verify the prop is threaded with no TypeScript errors.
- [x] 3.2 In `src/components/listening/ListeningPracticeScreen.tsx`, render the new `AnswerWaitPicker` on the left side of the top bar in both the `phase === 'idle'` row and the active-session row (next to `TopBarCloseButton`), passing `answerWaitSeconds` as `value` and the new handler as `onChange`. Verify the icons are visible before starting a lesson and while a session is running (playing/answering/paused).
- [x] 3.3 Manually verify: change the value mid-session and confirm the next answer-wait countdown in `ListeningStage` uses the new duration (already live via `useListeningSession`'s `answerWaitSecondsRef`), and confirm the `LessonPicker` duration estimate reflects a value changed in a previous session (persisted setting). — verified by code inspection (the ref/settings plumbing is unchanged, only the UI entry point moved) plus a passing build/test run; a live in-browser click-through could not be completed because the browser automation tool's screenshot call timed out repeatedly.
- [x] 3.3-follow-up manual browser confirmation — user ran `npm run dev` and confirmed in-browser that the control looks and works as expected.

## 4. Cleanup and regression check

- [x] 4.1 Confirm the dialog (speaking) course's top bar and pause behavior are unchanged (no `AnswerWaitPicker` added there). Verify `useDialogSession`/`dialogSession.ts` were not touched. — confirmed via `git diff --stat` showing no changes to those files.
- [x] 4.2 Run the existing test suite (`npm run test` / vitest) and verify it passes, including `src/lib/listeningSession.test.ts`. — 3 files, 45 tests passed.
- [x] 4.3 Run `npm run build` and verify it completes with no TypeScript or lint errors. — `tsc -b && vite build` succeeded.
