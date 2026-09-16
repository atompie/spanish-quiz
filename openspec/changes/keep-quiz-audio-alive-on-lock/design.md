## Context

`useListeningSession` and `useDialogSession` are structurally parallel: both drive a phase state machine (`idle` / playing.../ `answering`|countdown / `paused` / `finished`), both hold an `<audio>` ref, and both already implement pause/resume by storing a remaining-time deadline and restoring it. Neither has any awareness of page visibility, backgrounding, or the Screen Wake Lock API today (see proposal.md - Why).

The app is served as an iOS "Add to Home Screen" standalone PWA (`apple-mobile-web-app-capable`, `display: 'standalone'`). Standalone web apps on iOS are suspended/killed on lock or backgrounding much more aggressively than a Safari tab, and the OS may fully discard the WKWebView process rather than just freeze it — in that case, in-memory-only state (React state, refs, closures) is gone and the next launch is a fresh page load, not a resumed one.

## Goals / Non-Goals

**Goals:**
- Prevent the screen from auto-locking while a listening or dialog session is actively running, using the Screen Wake Lock API.
- Make an interruption (explicit backgrounding, or the OS discarding and reloading the app) recoverable: persist enough state to resume the same session at the same point.
- Share this behavior between `useListeningSession` and `useDialogSession` rather than duplicating it, since both hooks already share the same phase-machine shape.

**Non-Goals:**
- Guaranteeing continued audio playback while the screen is actually locked. iOS does not give standalone web apps a reliable background-audio entitlement; once locked, audio stopping is accepted as expected, not a bug to chase further.
- Cross-device sync of session state. Persistence here is local-only (one browser/app instance), just enough to survive a single suspend/reload cycle.
- Changing pause/resume UI or semantics beyond making the existing guarantee also apply to implicit (OS-driven) pauses.

## Decisions

**Shared hook, not per-session duplication.** Extract a small `useKeepSessionAlive`-style helper (exact naming left to implementation) that: (a) requests/releases a Screen Wake Lock based on an `isActive` boolean the caller derives from its own phase, and (b) exposes save/load functions for a small JSON blob of resumable state. Both `useListeningSession` and `useDialogSession` call it with their own `isActive` and their own state shape. Rationale: the two hooks are already parallel in every other respect (see Context); a shared helper avoids two copies of wake-lock lifecycle and storage-key handling drifting apart. Alternative considered: implement independently in each hook — rejected, pure duplication of identical lifecycle logic.

**Persistence via `sessionStorage`, not `localStorage`.** A session is meant to be resumed within the same visit, not indefinitely; `sessionStorage` naturally clears on an actual app close/reinstall rather than lingering as stale state across unrelated future launches. Write on every phase transition (already-existing state-transition points), not on a timer, to keep it cheap and always current. Alternative considered: `localStorage` — rejected because it would resume a long-abandoned session days later with no way to distinguish "briefly locked" from "gave up".

**Treat backgrounding as the existing `paused` phase, not a new phase.** `visibilitychange`/`pagehide` handlers call the same `togglePause()` path already used for explicit pause, reusing its deadline-freezing logic (`remainingMsAtPauseRef`) instead of introducing parallel state. On `visibilitychange` back to visible (same in-memory session survived), resume is just the existing explicit-resume path. On a fresh page load where persisted state is found instead (process was actually killed), the resume path is a rehydration step: restore `plan`/`roundIndex`/`phase`/`deadline` into fresh state, then enter `paused` so the learner explicitly resumes (rather than silently auto-playing audio on an unexpected page load, which would be a jarring/unwanted autoplay).

**Screen Wake Lock request scoped tightly to "actively running".** Requested only while a session is in a playing/answering/countdown/post-answer-pause phase — released immediately on `paused`/`stopped`/`finished` — rather than for the whole time a practice screen is mounted. This matches the actual problem (screen locking *during* active, hands-off audio playback) and avoids unnecessarily fighting the OS's lock behavior once the learner has already paused or left.

## Risks / Trade-offs

- [Screen Wake Lock support in iOS standalone-mode Safari has had inconsistent history across iOS versions] → Treat the request as best-effort: guard with a feature check, no error surfaced to the learner if unsupported or if the browser denies/releases it (e.g. OS-level battery saver); the persistence/resume path remains the safety net regardless.
- [`sessionStorage` can still be cleared if iOS fully evicts the app's storage, not just its process] → Acceptable: the fallback (idle/start state) is already specified in the specs for this case; it's a graceful degradation, not a silent break.
- [Auto-resuming audio immediately after rehydration could play sound unexpectedly if the learner reopened the app for an unrelated reason] → Addressed by design: rehydration always lands in `paused`, requiring an explicit tap to resume, never auto-plays.
- [Wake Lock is released by the OS whenever the tab/app is hidden regardless of app code] → Not a functional risk here since the goal is only to prevent *voluntary* screen-off during foreground use; re-acquire is attempted again each time the session re-enters an active phase in the foreground.

## Migration Plan

Additive change to two existing hooks; no data migration, no API changes, no breaking changes to existing pause/resume behavior for sessions that stay foregrounded. Ship behind no flag — degrades gracefully on browsers/platforms without Wake Lock support. Rollback is a plain revert if issues surface.
