## Why

The dialog quiz currently shows only one sentence at a time, centered under a large pulsing countdown circle, with no visible history of the conversation. This makes it hard to follow the back-and-forth of a two-person dialog and to see how far into the exchange the learner has progressed. Reshaping the screen as a compact chat window — with each character's lines on a consistent side and the learner's active turn clearly highlighted — makes the conversational structure visible and keeps the countdown attached to the turn it belongs to.

## What Changes

- Replace the single-sentence stage with a scrollable chat log: each finished turn becomes a static bubble, positioned left or right by the dialog character it belongs to (`text index % 2`), independent of which mode is running.
- The in-progress turn renders as a live bubble at the end of the log: it shows the native-language text while playing/counting down, then updates in place to the Spanish text once revealed. Once the turn is a learner turn, its Spanish text is what remains in history.
- Only the in-progress bubble pulses/animates; all other bubbles are static.
- While a turn is a learner turn and still in progress, its bubble gets an orange active background and a small countdown-seconds tag in its corner; native-speaker turns get no tag. Once a turn finishes, its bubble fades to the same neutral style as every other bubble (no permanent orange in the log).
- The chat log resets to empty at each mode transition (Mode A -> Mode B), so each pass renders as its own clean conversation.
- Remove the large centered pulsing countdown circle; the overall stage becomes a smaller, chat-shaped panel instead of filling the screen.
- The turn-progress bar above the stage (`X/Y`) is unchanged.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `dialog-course`: the "Language-synced text display" requirement changes from showing a single current sentence to maintaining a chat-style history of finished turns plus one live in-progress bubble, with turn side, active-turn highlighting, per-turn animation, and countdown-tag placement newly specified.

## Impact

- `src/components/dialog/DialogStage.tsx`: rewritten to render a chat log (list of bubbles) instead of one centered sentence + countdown circle.
- `src/components/dialog/DialogPracticeScreen.tsx`: passes turn history data to `DialogStage` instead of just `currentText`/`secondsRemaining`.
- `src/hooks/useDialogSession.ts`: needs to expose enough state to build the log (per-turn finalized text, current turn's live text/phase, mode boundaries for reset) in addition to (or instead of) the current single `currentText`.
- `src/index.css`: new chat-bubble styles (left/right alignment, active/orange state, corner tag, per-bubble pulse animation) replacing `.listening-stage*` rules used by this screen.
- No change to audio playback, countdown timing/math, pause/resume, or missing-recording fallback logic — this is a display-layer change only.
