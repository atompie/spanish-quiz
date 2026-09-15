## Why

The existing "listening & speaking" course drills isolated sentences with fixed repeats. Learners have no practice for live back-and-forth conversation, where they must translate a native-language line in their head and reply in Spanish under time pressure. A new "Dialogi" course type simulates that experience using scripted two-person dialogs.

## What Changes

- Add a new `dialog` quiz kind, selectable from the existing "Kursy" quiz-kind picker alongside `phrase` / `conjugation` / `listening`.
- Add a dialog-picker screen (mirrors the existing lesson picker) listing available dialogs from `public/dialog/`.
- Add a dialog playback engine that runs each selected dialog twice in one session:
  - Mode A ("Rozmówca zaczyna"): native speaker takes even indices, learner takes odd indices.
  - Mode B ("Ty zaczynasz"): learner takes even indices, native speaker takes odd indices.
  - A short banner ("Teraz Ty zaczynasz") auto-transitions from Mode A to Mode B.
- Native-speaker turns play `es/{i+1}.mp3` only. Learner turns play the native-language line, run a countdown for silent translation, then play the `es/{i+1}.mp3` correct version.
- Countdown/wait duration is length-based, not a fixed setting:
  - When the driving mp3 exists: `wait = clamp(audioDuration * 1.5 + 1, 2, 15)` seconds, measured from the actual `<audio>` duration.
  - When the driving mp3 is missing: same shape, driven by native-text word count instead of audio duration: `wait = clamp(0.6 * wordCount + 1, 2, 15)` seconds. Applies uniformly to any missing-audio turn (learner countdown, or any text-only substitute for a missing native/target mp3).
- Missing mp3 handling: if an expected mp3 for a turn is absent, skip playback and show only the text for the computed wait duration, then continue — never exclude a dialog or a turn outright for missing audio.
- Text display: always shows the native-language text during native-language phases and the Spanish text during Spanish-playback phases (same behavior as the existing listening course's `currentText`).
- Pause/resume: identical deadline-based mechanism as the listening course — pausing mid-countdown or mid-playback resumes from exactly where it stopped.
- Session end: once both Mode A and Mode B complete, return directly to the dialog list — no intermediate "finished" screen.
- New data layout under `public/dialog/`:
  - `public/dialog/metadata.json` — shared text file for all dialogs (mirrors `public/speak/metadata.json`), keyed by dialog id, with `level` and a `text` array of `{pl, en, de, es}` entries per turn.
  - `public/dialog/dialog_1/{es,pl,en,de}/N.mp3`, one folder per dialog, same nesting depth as `public/speak/<lesson>/<lang>/N.mp3` (no `slug` level — a dialog has no sub-parts, only turns).
  - A generated `public/dialog/manifest.json` (mirrors `speakManifestGenerator.ts`, one level shallower — no `slug` directory) reporting per-language mp3 counts per dialog, used the same way `speak/manifest.json` is used today: to detect available/missing recordings, never to fail a build.

## Capabilities

### New Capabilities
- `dialog-course`: A two-pass (native-starts / learner-starts) scripted dialog practice course with length-based translation countdowns, text-only fallback for missing audio, and pause/resume.

### Modified Capabilities
(none — no existing spec-level behavior changes; this is purely additive alongside the existing listening course)

## Impact

- New UI: dialog-kind option in `QuizKindPicker`, a dialog picker screen (new component, analogous to `LessonPicker`), a dialog playback screen/state machine (new hook, analogous to `useListeningSession` but with a fixed two-pass plan instead of shuffled repeat rounds).
- New types: `QuizKind` gains `'dialog'`; new types for dialog metadata/session state (analogous to `src/types/speak.ts`).
- New build tooling: a dialog-manifest generator script + Vite dev-watch plugin (analogous to `scripts/speakManifestGenerator.ts` / `scripts/vite-plugin-speak-manifest.ts`), wired into `predev`/`prebuild`.
- New static assets under `public/dialog/` (metadata + per-dialog mp3 folders) — content to be recorded/authored separately; out of scope for this change's code.
- No changes to the existing `speak/` listening course, its engine, or its data.
