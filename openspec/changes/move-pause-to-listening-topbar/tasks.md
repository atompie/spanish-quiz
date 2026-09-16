## 1. Build the pause/resume icon

- [ ] 1.1 Create `src/components/common/PauseIcon.tsx` (two vertical bars, `viewBox="0 0 24 24"`, matching the stroke/style conventions of `PlayIcon.tsx`/`CloseIcon.tsx`). Verify it renders standalone at 18x18 inside a `.btn-icon`.

## 2. Move the control into the top bar

- [ ] 2.1 In `src/components/listening/ListeningPracticeScreen.tsx`, add a `.listening-topbar-actions` wrapper (in the active-session top bar block only) containing a new icon `<button>` (using `PauseIcon` when not paused, `PlayIcon` when `isPaused`, `onClick={togglePause}`, `aria-label`/`title` set to `t.listeningPause`/`t.listeningResume` accordingly) followed by the existing `<TopBarCloseButton>`. Verify the icon appears to the left of the close icon while a session is playing/answering/paused, and does not appear on the idle (pre-start) top bar.
- [ ] 2.2 Remove the bottom `.listening-controls` block (and its now-unused import if any) from `ListeningPracticeScreen.tsx`. Verify `npm run build` reports no unused-import or unused-variable errors.
- [ ] 2.3 Add `.listening-topbar-actions` styling to `src/index.css` (flex row, small gap, aligned with the existing `.btn-icon` sizing) and remove the now-unused `.listening-controls` rule. Verify visually at both mobile (~400px) and desktop widths that the pause/resume and close icons sit together on the right with even spacing.

## 3. Verify behavior

- [ ] 3.1 Manually verify: start a listening session, click the new pause icon, confirm playback/countdown pauses and the icon switches to the resume (play) glyph; click again and confirm it resumes and the icon switches back. Confirm the stop confirmation flow (clicking the close icon) still works unaffected.
- [ ] 3.2 Confirm the dialog (speaking) course's pause button and top bar are unchanged. Verify `git diff --stat` shows no changes to `DialogPracticeScreen.tsx`, `DialogTopBar.tsx`, `useDialogSession.ts`, or `dialogSession.ts`.
- [ ] 3.3 Run the existing test suite (`npm run test`) and verify it passes.
- [ ] 3.4 Run `npm run build` and verify it completes with no TypeScript or lint errors.
