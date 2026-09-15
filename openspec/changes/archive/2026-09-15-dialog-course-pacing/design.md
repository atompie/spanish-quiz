## Context

`useDialogSession.ts` drives turn playback through a `DialogTurnPhase` state machine (`native-playing` / `native-wait-fallback` → `countdown` → `target-playing` / `target-wait-fallback`), with `advance()` called directly from `target-playing`'s `ended` audio event and from the `target-wait-fallback` deadline tick. Both call sites jump straight to the next turn with no phase in between. See proposal.md - Why.

The two duration formulas already in `dialogSession.ts` (`waitFromAudioDuration`, `waitFromWordCount`) both funnel through a shared `clampWait` (2–15s). The new pause reuses that shape rather than introducing a separate range.

## Goals / Non-Goals

**Goals:**
- Insert one new turn sub-phase after every Spanish-line completion (both speakers), before `advance()`.
- Size that pause from the duration that just played: the translation's duration for learner turns, the Spanish line's own duration for native-speaker turns.
- Make the new phase behave like existing wait phases for pause/resume and for the countdown-tag UI, without new UI code.

**Non-Goals:**
- No change to the translation countdown formula, the fallback-wait formula, or the two-pass (Mode A / Mode B) structure.
- No new visual treatment beyond what `DialogStage`'s existing countdown tag already renders.
- No change to how native-speaker turns are chosen or ordered.

## Decisions

**New `DialogTurnPhase` value: `'post-answer-pause'`.**
Added alongside the existing five phases. Both `target-playing`'s `ended` handler and `target-wait-fallback`'s deadline tick, which currently call `advance()` directly, instead start this phase with a computed deadline; `advance()` moves to `post-answer-pause`'s own deadline expiry instead.

**Duration source, captured at the point it's known:**
- Learner turn: the countdown's duration is already computed once, from the native-language recording's real `audio.duration` (via `waitFromAudioDuration`) or from `waitFromWordCount` on the native fallback text. That same seconds value is stashed in a new ref (`lastTranslationSecondsRef`) at the point the countdown starts, and read back when `post-answer-pause` is entered after the Spanish line.
- Native-speaker turn: there's no prior translation value to reuse. The pause is derived from the Spanish line's own duration — `audio.duration` when `target-playing` finished via real playback, or the same seconds already used for `target-wait-fallback`'s deadline when it was a fallback.

  Alternative considered: track a single "last relevant duration" ref updated at every phase transition, used uniformly regardless of speaker. Rejected because it conflates two conceptually different durations (a translation vs. the Spanish line itself) behind one name, which reads misleadingly at the native-speaker call site — explicit per-speaker sourcing is clearer.

**New helper: `pauseFromDuration(seconds)` in `dialogSession.ts`.**
`clampWait(seconds * 0.5)`, mirroring `waitFromAudioDuration`/`waitFromWordCount`'s existing shape (plain function, shared `clampWait`). Reusing the 2–15s clamp means a very short line still gets a minimum 2s beat, and a long line's pause is capped rather than growing unbounded.

**Pause/resume wiring:** `'post-answer-pause'` is added to the two phase-name lists that currently gate deadline-based pausability (the `isWaitPhase` check in the tick effect, and the equivalent branch in `togglePause`) — the same mechanism already used for `countdown` and the `*-wait-fallback` phases, no new pause logic.

**UI:** `currentText`'s language mapping is extended so `post-answer-pause` keeps showing the Spanish text (same as `target-playing`/`target-wait-fallback`).

The corner tag itself gets distinct treatment per phase, per a follow-up decision: during `countdown`/`*-wait-fallback`, the existing top-corner numeric tag is kept (the remaining time is actionable there — the learner is timing their own speech attempt). During `post-answer-pause`, the tag instead renders in the bottom corner with a small spinning icon (an inline SVG arc, rotated via CSS `animation`) and no number — signaling "the exchange is still ongoing" rather than a countdown to act against. `DialogStage` now takes `turnPhase` as a prop (passed through from `useDialogSession` via `DialogPracticeScreen`) to distinguish the two cases; both remain gated to `isLearnerActive` only, matching the existing native-speaker-gets-no-tag rule. The spinner's animation is included in the existing `prefers-reduced-motion: reduce` exemption block alongside `.dialog-bubble--live`.

**CSS scope:** per user decision, bump `margin-bottom` (or equivalent spacing) directly on the shared `.listening-progress-bar-wrapper` class in `index.css`, applying to both `DialogPracticeScreen` and `ListeningPracticeScreen` rather than introducing a dialog-only variant.

## Risks / Trade-offs

- [Extra ref (`lastTranslationSecondsRef`) adds a bit of state to an already ref-heavy hook] → Scoped narrowly (set only where the countdown is started, read only at one call site), matching the existing pattern of `deadlineRef`/`remainingMsAtPauseRef`.
- [Total per-turn time increases by up to 15s per line] → Matches the explicit ask (pacing for retention); the existing 2–15s clamp bounds the worst case the same way it already bounds the countdown.
- [Listening screen's spacing changes as a side effect of the shared CSS class] → Accepted per user decision in explore; low risk since added whitespace rarely reads as a regression.
