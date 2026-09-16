## Context

`ListeningPracticeScreen.tsx` currently renders `.listening-topbar` as a `space-between` row: `AnswerWaitPicker` on the left, `TopBarCloseButton` on the right. `TopBarCloseButton` renders its own wrapping `.quiz-topbar` div (`justify-content: flex-end`) around the close icon, and is reused as-is by the dialog course and the quiz screen — it must not change shape for those callers. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Group the pause/resume icon and the close icon together on the right side of the top bar: `[wait-picker] ... [pause/resume] [close]`.
- Reuse the existing `PlayIcon` for the resume state; add a new `PauseIcon` matching the existing icon components' style (`viewBox="0 0 24 24"`, stroke-based).

**Non-Goals:**
- No change to `TopBarCloseButton`'s public API or its use in the dialog course / quiz screen.
- No change to `useListeningSession` pause/resume logic, timers, or storage.

## Decisions

- **Grouping wrapper, not a `TopBarCloseButton` API change**: add a small new wrapper element (`.listening-topbar-actions`, flex row with a small gap) around the new pause/resume icon button and the existing `<TopBarCloseButton>`, rather than adding a "leading action" prop to `TopBarCloseButton`. `TopBarCloseButton` is shared by the dialog course and the quiz screen, which don't need this grouping; keeping it a plain, single-purpose component avoids a prop that only one caller uses.
- **Icon-only button, plain `btn-icon` style**: the pause/resume button uses the existing `.btn-icon` class (not `--inverted`), matching the plain-style icon buttons already used for the finished-screen's "start new"/"change lesson" actions. `TopBarCloseButton` keeps its own `--inverted` accent style, so the close icon remains visually distinct as the "leave" action.
- **Conditional render, not disabled state**: the pause/resume icon is only rendered in the active-session top bar block (the branch already distinct from the idle-phase block in `ListeningPracticeScreen.tsx`), rather than always rendering it and disabling it before start - there is nothing to pause before a session exists, so a disabled icon would be a dead affordance.

## Risks / Trade-offs

- [Removing `.listening-controls` changes the screen's bottom spacing] -> the block currently uses `margin-top: auto` to pin content to the bottom of a flex column; removing it should have no visible effect on `ListeningStage`/`ProgressBar` layout above it, but verify visually at both mobile (~400px) and desktop widths after the change.
