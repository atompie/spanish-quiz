## 1. Data types

- [x] 1.1 Add `src/types/dialog.ts` with `DialogMetadata`, `DialogTurnText` (`{pl, en, de, es}`), `DialogSentenceManifestEntry`, `DialogPhase`, and turn-ownership types (mirroring `src/types/speak.ts` minus repeat-count concepts), and verify `tsc -b` compiles with no type errors.
- [x] 1.2 Add `'dialog'` to the `QuizKind` union in `src/types/quiz.ts` and verify `tsc -b` reports every non-exhaustive `switch`/conditional over `QuizKind` that now needs a case.

## 2. Manifest generation tooling

- [x] 2.1 Add `scripts/dialogManifestGenerator.ts` (scan `public/dialog/dialog_*/`<lang>/N.mp3, no `slug` level, mirroring `scanSpeakManifest`) and `scripts/generate-dialog-manifest.ts` CLI entry point; verify running it against a hand-created fixture `public/dialog/dialog_1/es/1.mp3` (empty placeholder file) produces a `manifest.json` with `counts.es === 1`.
- [x] 2.2 Add `scripts/vite-plugin-dialog-manifest.ts` (mirrors `vite-plugin-speak-manifest.ts`) and register it in `vite.config.ts`; verify adding/removing a file under `public/dialog/` during `npm run dev` regenerates `public/dialog/manifest.json` without a server restart.
- [x] 2.3 Wire `generate:dialog-manifest` into `package.json` `predev`/`prebuild` scripts alongside the existing speak-manifest ones; verify `npm run build` produces `public/dialog/manifest.json`.

## 3. Session engine

- [x] 3.1 Implement pure wait-formula functions (`waitFromAudioDuration`, `waitFromWordCount`, shared `clampWait`) in a new `src/lib/dialogSession.ts`, and verify unit tests cover the clamp boundaries (very short and very long input) and mid-range values from design.md's formulas.
- [x] 3.2 Implement dialog turn-plan construction in `src/lib/dialogSession.ts` (deterministic two-pass Mode A / Mode B plan from a dialog's `text[]`, no shuffling), and verify unit tests check turn ownership parity for both modes against the examples in `proposal.md` (`Mode A: rozmówca (i=0) → uczeń (i=1) → ...`, `Mode B: uczeń (i=0) → rozmówca (i=1) → ...`).
- [x] 3.3 Implement missing-recording detection against the fetched manifest counts, and verify a unit test confirms a turn whose index exceeds the manifest's mp3 count for that language is flagged missing.
- [x] 3.4 Implement `src/hooks/useDialogSession.ts` (phase state machine, deadline-based pause/resume reused from `useListeningSession`'s pattern, single shared `<audio>` element, `ended`-event-driven advance, mode-transition banner state, session-end callback), and verify a manual run in the app completes a full two-mode session end to end.

## 4. UI

- [x] 4.1 Add `useDialogLessons.ts` hook (mirrors `useSpeakLessons`) fetching `public/dialog/manifest.json` and `public/dialog/metadata.json`, and verify it exposes the dialog id list and metadata the same way `useSpeakLessons` does.
- [x] 4.2 Add `DialogPicker.tsx` (mirrors `LessonPicker.tsx`) listing available dialogs, and verify it renders one entry per dialog in a manual run against fixture content.
- [x] 4.3 Add `DialogStage.tsx` (mirrors `ListeningStage.tsx`) showing the language-synced text and countdown per `dialog-course` spec's "Language-synced text display" requirement, and verify the displayed text matches native text during native phases and Spanish text during Spanish phases in a manual run.
- [x] 4.4 Add `DialogPracticeScreen.tsx` (mirrors `ListeningPracticeScreen.tsx`, but on session end calls back to the picker instead of rendering a finished screen, per the "Two-pass session structure" spec's session-end scenario), including the pause/resume control and the "Teraz Ty zaczynasz" transition banner, and verify pausing mid-countdown and mid-playback then resuming continues from the same remaining time/position in a manual run.
- [x] 4.5 Add the "Dialogi" option to `QuizKindPicker.tsx` and wire the `'dialog'` kind in `App.tsx` to render `DialogPracticeScreen`, and verify selecting "Dialogi" from the Kursy tab reaches the dialog picker.
- [x] 4.6 Add the new UI strings (kind title/description, transition banner text, any empty/error states) to every locale file under `src/i18n/translations` (pl/en/de), and verify `tsc -b` (or the existing i18n completeness check, if any) reports no missing keys.

## 5. Fixture content and manual verification

- [x] 5.1 Create a minimal fixture dialog under `public/dialog/dialog_1/` (short 3-4 turn script, `metadata.json` entry, placeholder or real mp3s for at least one language) sufficient to exercise both present-audio and missing-audio code paths, and verify the full spec scenario set (native-speaker turn, learner turn, missing-recording fallback for both native and Spanish slots, pause/resume, mode transition, session end back to list) can each be manually triggered and observed.
