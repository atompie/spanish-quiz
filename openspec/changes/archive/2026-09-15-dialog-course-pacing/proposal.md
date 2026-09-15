## Why

The Dialog course currently crams the progress bar against the chat window, and jumps straight from one line to the next the instant playback ends — including right after the learner hears the correct Spanish answer. Learners have no beat to digest a translation, re-read it, or repeat the Spanish sentence aloud before the next line starts.

## What Changes

- Add visual breathing room between the progress bar and the chat log on the Dialog (and Listening) practice screens.
- Insert a pause after every turn's Spanish playback (or its missing-recording fallback), before advancing to the next turn:
  - For learner turns: the pause is 85% of the translation (native-language) duration just used for that turn.
  - For native-speaker turns (which have no translation step): the pause is 85% of the Spanish line's own duration.
- The new pause is pausable/resumable like existing countdowns and fallback waits, and reuses the existing countdown-tag display (visible only while the turn belongs to the learner).

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `dialog-course`: adds a post-answer pause after both native-speaker and learner turns before advancing, sized from the turn's translation or Spanish-line duration; existing turn-playback and pause/resume requirements extend to cover this new phase.

## Impact

- `src/lib/dialogSession.ts`: new duration-to-pause helper.
- `src/hooks/useDialogSession.ts`: new turn sub-phase inserted after `target-playing`/`target-wait-fallback`, wired into the existing pause/resume and countdown-tick logic.
- `src/index.css`: spacing between `.listening-progress-bar-wrapper` and the content below it (affects both `DialogPracticeScreen` and `ListeningPracticeScreen`, per user decision).
- No changes to audio assets, manifest, or metadata format.
