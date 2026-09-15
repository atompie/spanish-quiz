## Context

The existing "listening & speaking" course (`src/hooks/useListeningSession.ts`, `src/lib/listeningSession.ts`, `src/components/listening/*`) already solves the hard parts this change needs: a deadline-based countdown that survives pause/resume without drift, an `<audio>`-driven phase state machine advancing on the `ended` event, and a build-time manifest generator (`scripts/speakManifestGenerator.ts` + `scripts/vite-plugin-speak-manifest.ts`) that scans `public/speak/` for contiguous `N.mp3` files per language and never fails the build on incomplete recordings. See `proposal.md` for why Dialogi needs a distinct engine rather than reusing this one as-is: fixed two-pass turn order instead of shuffled repeat rounds, and a length-based wait instead of a single fixed setting.

## Goals / Non-Goals

**Goals:**
- Reuse the listening course's proven pause/resume and audio-phase patterns rather than inventing new ones.
- Keep the new data layout (`public/dialog/`) structurally parallel to `public/speak/` so the manifest generator, dev-watch plugin, and fetch/caching approach can be copied with minimal changes.
- Make the length-based wait computation a small, independently testable pure function, since it has two input modes (real audio duration vs. word-count fallback) that must produce comparable results.

**Non-Goals:**
- Recording or authoring the actual dialog content (mp3s, `metadata.json`) — out of scope, tracked as a content task only.
- Any change to the existing `speak/` listening course or its files.
- A summary/results screen after a dialog finishes (explicitly declined by the user — returns straight to the dialog list).
- Support for a target language other than Spanish, or a native language outside `en/pl/de` (matches current app-wide constraints).

## Decisions

### Data layout mirrors `public/speak/` minus the `slug` level
```
public/dialog/
  metadata.json                  // shared text source, keyed by dialog id
  manifest.json                  // generated: mp3 counts per lang per dialog
  dialog_1/
    es/ 1.mp3 2.mp3 ...
    pl/ 1.mp3 2.mp3 ...
    en/ ...
    de/ ...
  dialog_2/
    ...
```
`metadata.json` shape:
```jsonc
{
  "dialog_1": {
    "level": 1,
    "text": [
      { "pl": "Cześć", "en": "Hi", "de": "Hallo", "es": "Hola" },
      // index i -> file (i+1).mp3 in each language dir
    ]
  }
}
```
No `repeat` field (unlike `speak/metadata.json`'s `es` tuples) — Dialogi never repeats a line, so `SpeakEsEntry`'s `[text, repeat]` shape doesn't apply here; a dialog's `es` entries are plain strings like the other languages.

**Alternative considered**: one `dialog_N.json` file colocated per dialog folder, as originally sketched. Rejected in favor of a single shared `metadata.json` (user decision) to match the existing `speak/` precedent and let one fetch load all dialog text, same as `useSpeakLessons` does today.

### Manifest generator: new script, not a shared one
Add `scripts/dialogManifestGenerator.ts` (scan logic) + `scripts/generate-dialog-manifest.ts` (CLI) + a `dialogManifestPlugin()` in a new `scripts/vite-plugin-dialog-manifest.ts`, wired into `predev`/`prebuild` alongside the existing speak ones. This is a near-copy of `speakManifestGenerator.ts` with the `slug` directory level removed (dialogs scan straight from `dialog_N/<lang>/N.mp3`). Kept as a separate script rather than parameterizing the existing one, since the existing generator's module comment explicitly requires it stay stateless and single-purpose per content tree; forcing both directory shapes through one function would need a shape-detection branch for no shared benefit.

### New hook `useDialogSession`, not an extension of `useListeningSession`
Session shape differs enough that extending the listening hook would add more conditionals than it would save:
- **Plan**: deterministic two pass through the dialog's `text[]` (Mode A then Mode B), no shuffling, no repeat-count bookkeeping — replaces `buildSessionPlan`'s random round-based repeat logic entirely.
- **Turn ownership**: computed per index from `(index % 2, mode)` rather than looked up from a manifest-eligibility list.
- **Wait computation**: two independent formulas (audio-duration-based, word-count-based fallback) rather than one fixed `answerWaitSeconds` prop.
- **What's reused as-is**: the deadline-ref pause/resume mechanism (`deadlineRef`, `remainingMsAtPauseRef`, `TICK_MS` countdown interval), the `<audio>` `ended`-event-driven advance, and the single-`<audio>`-element approach (one hidden `<audio>` node reused for every clip via `audio.src` swaps).

Phase enum (new, parallel to `ListeningPhase`):
```
'idle' | 'mode-a' | 'mode-transition' | 'mode-b' | 'finished'
```
with a sub-state per turn (native-playing / native-wait-fallback / countdown / target-playing / target-wait-fallback) tracked alongside the turn index, since unlike the listening course there are two structurally different turn kinds (native-speaker vs. learner) interleaved by parity.

### Wait-duration formula as a pure function
```ts
function clampWait(seconds: number): number {
  return Math.min(15, Math.max(2, seconds))
}
function waitFromAudioDuration(durationSeconds: number): number {
  return clampWait(durationSeconds * 1.5 + 1)
}
function waitFromWordCount(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return clampWait(0.6 * words + 1)
}
```
Audio duration is read from the `<audio>` element's `duration` property once its `loadedmetadata` (or `ended`, which guarantees `duration` is populated) event has fired — no separate audio-probing step or stored duration data is needed at build time, unlike an approach that would require ffprobe-style tooling in the manifest generator.

**Alternative considered**: precompute and store durations in `manifest.json` at build time (would need an mp3-duration-reading dependency in the generator script). Rejected — reading `HTMLMediaElement.duration` at playback time is free, already-loaded data, and keeps the manifest generator dependency-free like the existing one.

### Missing-recording handling
A turn's language slot is "missing" when the manifest's per-language, per-dialog mp3 count is less than the turn's 1-based index. In that case the engine skips the `audio.play()` step for that slot entirely and instead starts a wait deadline of `waitFromWordCount(text)`, showing the same text UI as if audio were playing. This means the "does this slot have audio" check happens once per turn against the manifest (already fetched at session start, same as `useListeningSession` fetches `manifest.json`/`metadata.json` up front) — no per-file existence probing at playback time.

### UI wiring
- `QuizKind` gains `'dialog'`; `QuizKindPicker` gets a fourth option, translated via the existing i18n pattern (new keys per `src/i18n/translations`).
- `App.tsx` gains a branch analogous to the `'listening'` branch, rendering a new `DialogPracticeScreen` (mirrors `ListeningPracticeScreen`'s picker-then-session structure, minus the finished screen — session end calls straight back to the picker instead of setting a `finished` phase the screen would render).
- Dialog picker screen mirrors `LessonPicker`, backed by a new `useDialogLessons` hook mirroring `useSpeakLessons`.

## Risks / Trade-offs

- **Two independent wait formulas can feel inconsistent to the learner** (a missing recording might produce a noticeably different pause than a present one for the same sentence) → Mitigated by the shared `clampWait` bounds and matching linear shape; acceptable since missing recordings are expected to be temporary (content still being authored), not the steady state.
- **Duplicated manifest-generator logic** between `speak/` and `dialog/` (two near-identical scripts) → Accepted trade-off per the "no shared generator" decision above; revisit only if a third content tree with the same shape appears.
- **No results/finished screen** means a learner gets no completion feedback beyond landing back on the dialog list → Explicit user decision; not a defect to fix in this change.

## Migration Plan

Purely additive: new files, new `QuizKind` union member, new branch in `App.tsx`. No existing data, types, or screens are modified. Rollback is deleting the new files and the `'dialog'` union member/branch.
