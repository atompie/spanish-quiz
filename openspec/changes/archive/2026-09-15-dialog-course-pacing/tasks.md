## 1. Progress bar spacing

- [x] 1.1 Add spacing (e.g. `margin-bottom`) to `.listening-progress-bar-wrapper` in `src/index.css` and verify visually in both `DialogPracticeScreen` and `ListeningPracticeScreen` that the progress bar no longer sits flush against the content below it.

## 2. Pause duration helper

- [x] 2.1 Add `pauseFromDuration(seconds)` to `src/lib/dialogSession.ts` (`clampWait(seconds * 0.5)`) and verify with unit tests: a mid-range value halves correctly, a very short duration clamps to the 2s floor, a very long duration clamps to the 15s ceiling.

## 3. Post-answer pause phase

- [x] 3.1 Add `'post-answer-pause'` to the `DialogTurnPhase` union in `src/types/dialog.ts`.
- [x] 3.2 In `useDialogSession.ts`, add `lastTranslationSecondsRef` and set it wherever the learner-turn countdown's duration is computed (both the real-audio and fallback branches in `advanceWithinLearnerTurn`'s `native-playing`/`native-wait-fallback` handling).
- [x] 3.3 Change the `target-playing` `ended` handler (`handleEnded`) so that, instead of calling `advance()` directly, it starts `post-answer-pause` with a deadline from `pauseFromDuration(audio.duration)` for native-speaker turns, or `pauseFromDuration(lastTranslationSecondsRef.current)` for learner turns.
- [x] 3.4 Change the `target-wait-fallback` deadline-tick branch (currently falling through to `advance()`) the same way, using the fallback wait seconds already used for that deadline (native-speaker turns) or `lastTranslationSecondsRef.current` (learner turns) as the pause's basis.
- [x] 3.5 Add a deadline-tick handler for `post-answer-pause` that calls `advance()` when its own deadline expires.
- [x] 3.6 Add `'post-answer-pause'` to the `isWaitPhase` condition (tick effect) and to `togglePause`'s deadline-phase branch, so pause/resume preserves remaining time the same way it does for `countdown` and the `*-wait-fallback` phases.
- [x] 3.7 Extend the `currentLang` mapping so `post-answer-pause` continues showing the Spanish text (same as `target-playing`/`target-wait-fallback`).
- [x] 3.8 Verify manually in the running app: after a native-speaker line and after a learner line, the app pauses (visibly, via the countdown tag for learner turns) before the next line starts, and Pause/Resume during that pause preserves remaining time.

## 4. Post-answer pause indicator (bottom-corner spinner)

- [x] 4.1 Pass `turnPhase` from `useDialogSession` through `DialogPracticeScreen` into `DialogStage`.
- [x] 4.2 In `DialogStage.tsx`, show the existing numeric tag only for `countdown`/`*-wait-fallback` phases; during `post-answer-pause`, show a bottom-corner tag containing a spinning icon instead, still gated to learner turns only.
- [x] 4.3 Add `.dialog-bubble-tag--bottom` and `.dialog-bubble-tag-spinner` (with a `prefers-reduced-motion` exemption) to `src/index.css`.
- [x] 4.4 Update the `dialog-course` spec delta's "Active learner turn highlighting" requirement to describe the two distinct tag treatments (numeric/top-corner vs. spinner/bottom-corner) and re-run `openspec validate --strict`.

## 5. Spec sync

- [x] 5.1 Run `openspec validate --change dialog-course-pacing --strict` and fix any reported issues.
