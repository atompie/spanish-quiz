## Why

On iOS, this app runs as a standalone home-screen ("pinned") web app. When the screen locks — which happens quickly during a listening or dialog session because the learner isn't touching the screen between turns — iOS suspends or outright kills the standalone web app's process far more aggressively than it would a normal Safari tab. Audio cuts out immediately and, because all session state (current round, phase, plan) lives only in memory, the learner comes back to a reset app instead of their in-progress quiz.

## What Changes

- Acquire a Screen Wake Lock while a listening or dialog session is actively playing/waiting for an answer, and release it when the session pauses, stops, or finishes, so the screen doesn't auto-lock mid-session in the first place.
- Persist enough in-progress session state (lesson/dialog id, mode, turn/round index, phase, and remaining-time deadline) so that if the app is backgrounded or the OS reloads it anyway, the learner is offered to resume the same session at the same point instead of losing it.
- Detect backgrounding (`visibilitychange`/`pagehide`) and transition the session into its existing paused state proactively, instead of letting playback die uncleanly mid-audio.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `listening-lessons`: while a listening session is active, the system keeps the screen awake, and going to background/being suspended is treated as an implicit pause with resume-on-return instead of session loss.
- `dialog-course`: extends the existing pause/resume guarantee ("resume it from exactly the point it was paused, with no loss of elapsed progress") to also cover the screen locking or the app being backgrounded/suspended, and keeps the screen awake while a dialog session is active.

## Impact

- `src/hooks/useListeningSession.ts`, `src/hooks/useDialogSession.ts`: wake lock acquisition/release tied to session phase; `visibilitychange`/`pagehide` listeners; persistence of resumable session state (e.g. `sessionStorage`) and rehydration on load.
- `src/components/listening/ListeningPracticeScreen.tsx`, `src/components/dialog/DialogPracticeScreen.tsx`: possible UI for "resume your session?" on relaunch.
- No backend/API impact. No effect on desktop or non-standalone mobile browsing.
- Non-goal: this does not attempt to guarantee continued audio playback while the screen is actually locked — that capability is not reliably available to standalone web apps on iOS. The goal is to prevent the lock from happening during active use, and to make interruption recoverable when it does happen.
