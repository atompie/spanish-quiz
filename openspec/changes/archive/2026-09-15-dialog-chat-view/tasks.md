## 1. Session hook: track chat history

- [x] 1.1 Add a `sideForIndex(index: number): 'left' | 'right'` helper to `src/lib/dialogSession.ts`, next to `speakerForTurn`, and cover it with a unit test in `src/lib/dialogSession.test.ts` (even indices -> `'left'`, odd -> `'right'`)
- [x] 1.2 In `useDialogSession`, add a `history` state (`{ index: number; text: string }[]`) that appends the completed turn's Spanish text (`textRef.current[turn.index].es`) each time `advance()`/`enterPlanIndex()` moves past a turn, and verify manually (or via a hook test) that after N turns the array has N entries in order
- [x] 1.3 Clear `history` at the same point `enterPlanIndex` detects a mode change (`previousTurn.mode !== turn.mode`) and enters `'mode-transition'`, and verify the array is empty immediately after the transition starts
- [x] 1.4 Also clear `history` in `stop()`, alongside the other session state resets
- [x] 1.5 Expose `history` and a narrowed `currentTurn: { index: number; speaker: DialogSpeaker } | null` from `UseDialogSessionResult`, and update the hook's return statement and interface accordingly

## 2. Chat log rendering

- [x] 2.1 Rewrite `DialogStage` to accept `history`, `currentTurn`, `currentText`, `turnPhase`/`showCountdown`, and `secondsRemaining`, and render a scrollable list: one static bubble per `history` entry (side via `sideForIndex`), followed by one live bubble for `currentTurn` (side via `sideForIndex(currentTurn.index)`, content `currentText`)
- [x] 2.2 Apply the active/orange style and corner countdown tag to the live bubble only when `currentTurn.speaker === 'learner'`; show the tag only when `secondsRemaining !== null`
- [x] 2.3 Apply the pulse animation class to the live bubble only; history bubbles get no animation class
- [x] 2.4 Auto-scroll the log container to keep the live bubble visible whenever `currentText` or `currentTurn.index` changes
- [x] 2.5 Update `DialogPracticeScreen` to pass `history` and `currentTurn` (from the hook) through to `DialogStage`, removing props that are no longer needed (e.g. the old single-sentence-only shape) and verify the dialog screen still compiles and renders through Mode A -> transition -> Mode B in a manual run

## 3. Styling

- [x] 3.1 In `src/index.css`, replace `.listening-stage`, `.listening-stage-counter`, `.listening-stage-icon`, `.listening-stage-label`, `.listening-stage-sentence` (as used by the dialog screen) with a compact chat-log layout: scrollable container, left-aligned and right-aligned bubble variants, smaller bubble sizing than today's full-width sentence block
- [x] 3.2 Add the active/orange bubble style and a small corner-tag style for the countdown number
- [x] 3.3 Move the `listening-audio-pulse` animation onto the live-bubble modifier class only, and confirm `@media (prefers-reduced-motion: reduce)` still disables it
- [x] 3.4 Verify the listening quiz kind (which shares some `.listening-*` classes) is unaffected — run its screen manually and confirm no visual regression from the CSS changes in 3.1-3.3

## 4. Verification

- [x] 4.1 Run `npm test` (or the project's configured test command) and confirm `dialogSession.test.ts` and any other affected tests pass
- [x] 4.2 Manually run a full dialog session end to end: confirm bubbles accumulate left/right by character, only the live bubble pulses, learner turns show orange + countdown tag while in progress and fade to neutral once done, and the log resets to empty at the Mode A -> Mode B transition
