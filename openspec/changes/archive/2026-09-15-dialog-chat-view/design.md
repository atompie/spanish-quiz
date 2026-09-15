## Context

`useDialogSession` currently exposes only the *current* turn's display text (`currentText`) and countdown (`secondsRemaining`); nothing about earlier turns is retained once the session advances. `DialogStage` is a single presentational component that renders one centered bubble plus a big pulsing countdown circle. `DialogTurn` (`index`, `mode`, `speaker`) and `buildDialogPlan` (`lib/dialogSession.ts`) already encode which dialog character (`index % 2`) owns each line and who voices it in the current mode; the plan is laid out as a full Mode A block followed by a full Mode B block, so "since the current mode started" is just "since the plan index where `mode` last changed". See proposal.md for motivation and specs/dialog-course/spec.md for the exact required behavior.

## Goals / Non-Goals

**Goals:**
- Add a turn-history log to `useDialogSession` that the UI can render as chat bubbles, without touching audio playback, countdown math, pause/resume, or fallback logic.
- Keep the side (left/right) and active/highlight logic derivable from data already on `DialogTurn`, not duplicated as new parallel state.

**Non-Goals:**
- Changing the progress bar (`X/Y`), stop confirmation, or mode-transition banner content/timing.
- Changing audio file resolution, countdown durations, or fallback-wait durations.
- Persisting chat history across a stop/restart or across the two modes (it resets by design).

## Decisions

**History lives in `useDialogSession`, as a list of finalized `{ index, text }` entries.**
Each time a turn completes (i.e. `advance()`/`enterPlanIndex()` moves past it), its Spanish text (`text[turn.index].es`) is appended to a `history` state array. The array is cleared whenever a mode-transition is entered (same place that already detects `previousTurn.mode !== turn.mode` in `enterPlanIndex`). This keeps derivation in one place instead of asking the component to re-walk the plan from a "mode start index" on every render.
- *Alternative considered*: compute history in the component from `plan` + `planIndex`. Rejected because `plan`/`text` aren't currently exposed outside the hook, and exposing them would leak more internal shape than the small derived array does.

**Bubble side is a pure function of `index % 2`, not new state.**
Add `sideForIndex(index: number): 'left' | 'right'` to `lib/dialogSession.ts` (same module as `speakerForTurn`) so both the plan logic and the UI agree on the same rule without duplicating `% 2` checks. `DialogStage` calls it for both history entries and the live bubble.

**The live (in-progress) bubble is rendered separately from history, using existing `currentText`/`turnPhase`/`secondsRemaining`.**
No new "current" state is needed beyond what the hook already tracks; the hook additionally exposes `currentTurn`'s `index` and `speaker` (already computed internally, just not returned) so the component can pick the side and decide whether to show the active style.

**Active (orange) styling spans the whole learner turn; the countdown tag only shows a number when one exists.**
Orange applies whenever `currentTurn.speaker === 'learner'` and the turn is in progress (covers native-playing -> countdown/fallback -> target-playing). The corner tag renders only while `secondsRemaining !== null` (countdown or fallback-wait sub-phases), mirroring the existing `showCountdown` condition already computed in `DialogPracticeScreen`. During the audio-playing sub-phases (`secondsRemaining === null`) the bubble is orange but shows no tag.
- *Alternative considered*: orange only during the countdown sub-phase. Rejected: the user confirmed "the active speaker... should have orange background" describes the whole learner turn, and switching the background on/off mid-turn (audio -> countdown -> audio) would be visually noisier than keeping it steady for the turn's duration.

**Only the live bubble animates.**
The existing `listening-audio-pulse` keyframes move from `.listening-stage-icon`/`.listening-stage-sentence` to a single `.dialog-bubble--active` (or equivalently, whatever the live bubble's own modifier class is) rule. History bubbles get no animation class.

**Auto-scroll keeps the live bubble in view.**
`DialogStage` scrolls its log container to the bottom (`scrollIntoView` on the live bubble, or `scrollTop = scrollHeight` on the container) whenever the live bubble's content or turn index changes, so the learner doesn't have to manually scroll to see new turns as they play.

**Data shape change:** `UseDialogSessionResult` gains `history: { index: number; text: string }[]` and `currentTurn: { index: number; speaker: DialogSpeaker } | null` (a narrowed view of the existing internal `currentTurn` state), replacing the need for the component to infer anything about turn ownership itself. `currentText` and `secondsRemaining` are unchanged.

## Risks / Trade-offs

- [Risk] Resetting `history` on every mode-transition means a learner who pauses right at the transition and comes back loses no data (state persists across pause already), but if they scroll up expecting Mode A's lines during Mode B they won't find them. -> Mitigation: this matches the explicit product decision (reset on new mode); the transition banner itself signals a fresh start.
- [Risk] Appending to `history` on every `advance()` call is an unbounded array for very long dialogs within one mode. -> Mitigation: dialogs here are short (a handful of turns per pass, per the existing `dialog_1` content), so this is not a real scaling concern.
- [Trade-off] Keeping side purely a function of `index % 2` means a learner's own two lines (as character A in Mode B, character A again... ) can appear on different sides across dialogs only if a dialog's characters aren't strictly alternating — but `buildDialogPlan`/`speakerForTurn` already assume strict alternation by index parity, so this introduces no new inconsistency.
