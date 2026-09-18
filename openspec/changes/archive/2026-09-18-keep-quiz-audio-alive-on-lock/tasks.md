## 1. Shared session-continuity helper

- [x] 1.1 Implement a shared helper (e.g. `src/hooks/useSessionContinuity.ts`) that requests/releases a Screen Wake Lock based on an `isActive` boolean, with a feature check and silent no-op when `navigator.wakeLock` is unsupported or the request fails; verify with a unit test that the lock is requested when `isActive` becomes `true` and released when it becomes `false` or on unmount.
- [x] 1.2 Add save/load functions to the same helper for a small JSON blob in `sessionStorage`, keyed per session type (listening vs dialog); verify with a unit test that saved state round-trips through save → load unchanged, and that a missing/corrupt key loads as `null` rather than throwing.
- [x] 1.3 Add `visibilitychange`/`pagehide` wiring in the helper that invokes caller-supplied `onHide`/`onShow` callbacks; verify with a unit test (simulated `document.hidden` toggling) that both callbacks fire exactly once per transition.

## 2. Listening session integration

Note: this repo has no `jsdom`/`@testing-library/react` (confirmed: `vitest.config.ts` only
includes `src/**/*.test.ts`, and no existing hook has a test — only plain `lib/` functions do).
Per explicit user decision, 2.2/2.3 are verified by code review + manual iOS checks (tasks
5.1-5.3) instead of automated hook-level unit tests; the underlying wake-lock/storage/visibility
primitives they build on remain fully unit-tested in `sessionContinuity.test.ts`.

- [x] 2.1 Wire `useListeningSession` to the wake-lock helper with `isActive` true during `playing-native`/`playing-target`/`answering`/`gap`; verify manually (or via a mock Wake Lock API in a test) that the lock is held only during those phases.
- [x] 2.2 On `onHide`, if the session is in an active phase, route through the existing `togglePause()` path (same as an explicit pause) and persist `{ lesson, roundIndex, phase, remainingMsAtPause }`; verified by code review (no hook-test infra — see note above).
- [x] 2.3 On app load, check for persisted listening-session state; if present and still resumable (matching `lesson` still selected/available), rehydrate `planRef`/`roundIndex`/`currentRound` and enter `paused` (never auto-play); if the session already survived in memory (`onShow` after a same-process hide), just resume via the existing explicit-resume path. Verified by code review (no hook-test infra — see note above); real-device check is task 5.2.
- [x] 2.4 Clear persisted listening-session state on `stop()` and on `finished`; verified by code review (no hook-test infra — see note above; `clearSessionState` itself is unit-tested in `sessionContinuity.test.ts`).

## 3. Dialog session integration

Same test-infra note as group 2 applies here (no `jsdom`/`@testing-library/react`; verified by
code review + manual iOS checks 5.2/5.3 instead of hook-level unit tests).

- [x] 3.1 Wire `useDialogSession` to the wake-lock helper with `isActive` true during playback, countdown, fallback wait, and post-answer-pause phases; verified by code review — `isActiveDialogPhase` covers `mode-a`/`mode-transition`/`mode-b`.
- [x] 3.2 On `onHide`, if the session is in an active phase, route through the existing `togglePause()` path and persist `{ dialog, planIndex }` (mode/turn/history are deterministically derivable from `dialog` + `planIndex`, unlike listening's randomized plan — no need to persist them separately); verified by code review.
- [x] 3.3 On app load, check for persisted dialog-session state; if present and resumable, rehydrate mode/turn/history and enter `paused`; if the session survived in memory, resume via the existing explicit-resume path. Verified by code review; real-device check is task 5.3.
- [x] 3.4 Clear persisted dialog-session state on `stop()` and on `finished`; verified by code review (`clearSessionState` itself is unit-tested in `sessionContinuity.test.ts`).

## 4. UI for resuming

- [x] 4.1 Add a "resume your session?" affordance shown when a practice screen mounts and finds rehydrated-but-paused state (both `ListeningPracticeScreen` and `DialogPracticeScreen`), letting the learner resume or discard it; verified by code review (reuses `ConfirmModal`, `discardResumableSession` clears `sessionStorage` via `clearSessionState`, tested in `sessionContinuity.test.ts`). Manual confirmation of the full flow is covered by tasks 5.2/5.3.

## 5. Manual verification on iOS standalone

- [x] 5.1 On an iPhone with the app added to the Home Screen, start a listening session, let it sit idle (hands off) long enough to previously trigger auto-lock, and confirm the screen no longer locks on its own during active playback/answering.
- [x] 5.2 On the same setup, manually lock the screen (side button) during a session, then unlock and reopen the app; confirm it offers to resume at the correct round/turn rather than resetting.
- [x] 5.3 Repeat 5.1 and 5.2 for a dialog session.
