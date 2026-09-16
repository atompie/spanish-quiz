## Context

See proposal.md - Why/What Changes for motivation and scope.

Relevant existing code:
- `src/hooks/useDialogSession.ts` - `beginTurn()` decides, per learner turn, between `turnPhase: 'native-playing'` (loads and plays the native-language recording via the audio-playback effect at lines ~271-284) and `turnPhase: 'native-wait-fallback'` (text-only, timed by `waitFromWordCount`, used today only when `hasRecording(...)` is false). `advanceWithinLearnerTurn` computes `lastTranslationSecondsRef` from either the actual audio duration (`waitFromAudioDuration`) or the word-count fallback, and that value later drives the post-answer pause via `enterPostAnswerPause`.
- `src/components/dialog/DialogStage.tsx` renders the same countdown tag for `native-wait-fallback` and `countdown` regardless of cause - confirmed there is no "missing recording" visual distinct from a generic wait, so reusing this phase for "audio disabled by choice" introduces no misleading UI.
- `src/lib/storage.ts` holds the existing `theme` load/save pair (`loadTheme`/`saveTheme`, key `quiz.theme`) as the precedent for a small standalone persisted setting outside the `QuizSettings` blob.
- `src/components/common/TopBarCloseButton.tsx` renders the `.quiz-topbar` div (currently `justify-content: flex-end`, one button) used by both `DialogPracticeScreen` and `ListeningPracticeScreen`.
- `--color-accent` (in `src/index.css`) already resolves to black in light theme and white in dark theme, matching the requested marked-icon color exactly. The marked/colored (`.dialog-audio-toggle--marked`) state is applied when native-language audio playback is **enabled**; disabled uses the default, unmarked styling. (This polarity was flipped once during implementation per user feedback, then flipped back — see git history on `DialogTopBar.tsx` for the sequence; the current, final state is: enabled = marked.) The icon glyph mapping is independent of the marking and was set by explicit user request: `SpeakerOnIcon` (plain speaker) renders when disabled, `SpeakerOffIcon` (muted/crossed-out) renders when enabled.

## Goals / Non-Goals

**Goals:**
- Gate native-language playback on learner turns behind a persisted, learner-controlled setting, defaulting to off.
- Keep the change scoped to the Dialogi course: no effect on Spanish playback, on other quiz kinds, or on the global Settings screen.
- Reuse existing mechanisms (word-count fallback timing, `--color-accent` theming, the `storage.ts` load/save pattern) rather than adding new ones.

**Non-Goals:**
- Not changing the pacing formulas themselves (`waitFromWordCount`, `waitFromAudioDuration`, `pauseFromDuration`).
- Not adding a global/app-wide audio settings screen; the control lives only in the Dialogi top bar.
- Not changing behavior for genuinely missing recordings (that fallback path already exists and is reused, not altered).

## Decisions

**Distinguish "recording missing" from "disabled by toggle" — they are NOT the same case.**
Initial implementation reused `native-wait-fallback` for both causes (missing recording, and audio disabled by choice), on the reasoning that both need "no audio, text shown, word-count timing." That was wrong: the *existing* missing-recording fallback is deliberately two steps (`native-wait-fallback` showing the text, then a separate `countdown` of the same length) per the pre-existing "Missing-recording fallback" requirement - reasonable for the rare case of a genuinely absent file. But when audio is disabled by choice, that becomes the *common* path (the default), and stacking two equal-length waits back to back roughly doubles every learner turn's wait time - reported by the user as "the counter is countered twice" after toggling audio off and encountering this path for the first time.

Fixed by introducing `resolveNativeStepMode(nativeAudioEnabled, entry, nativeLanguage, element)` (`src/lib/dialogSession.ts`), returning one of three modes instead of a boolean:
- `'play'` - audio enabled and recording exists -> `'native-playing'` (unchanged).
- `'text-only'` - audio disabled but the recording exists -> skip straight to `'countdown'` with the word-count-based wait, so the single wait period serves as both the text display and the translation countdown. No `native-wait-fallback` step at all in this case.
- `'missing'` - recording does not exist, regardless of the toggle -> the original two-step `'native-wait-fallback'` -> `'countdown'` fallback, unchanged.

This keeps the rare "genuinely missing recording" case exactly as it was (still spec'd as two steps), while making "disabled by choice" - now the default and common case - a single wait, matching what a learner actually needs (read the translation once, that's the countdown).

Alternative considered: keep loading the audio file silently (muted) so timing stays based on actual recording duration even when "disabled." Rejected per explicit user direction - the requirement is to never play the native-language part, text-only, using the existing fallback timing formula, not to preserve recording-length-based pacing.

**Persist the setting as its own `storage.ts` key, not inside `QuizSettings`.**
`QuizSettings` (`quiz.settings`) is loaded/saved as one JSON blob shared across quiz kinds and drives the global Settings screen. This toggle is specific to the Dialogi top bar and unrelated to the settings screen's concerns. Following the `theme` precedent (its own key, own load/save functions) keeps the change additive and avoids growing `QuizSettings` with a field most quiz kinds never read. Default value `false`, matching `DEFAULT_THEME`'s pattern of a module-level constant.

**Own the setting's state in `useDialogSession`, read via a new hook parameter or internal load, not passed down from `App.tsx`.**
Unlike `nativeLanguage` (an app-wide setting needed by three quiz kinds), this toggle is Dialogi-only and mutated entirely within the Dialogi screen. `DialogPracticeScreen` will hold the toggle's state (loaded from storage on mount) and pass both the current value and a setter into `useDialogSession`, mirroring how `nativeLanguage` is already threaded through today. `useDialogSession` uses the value to decide the `beginTurn` branch above; it does not itself own persistence.

**New icon components rather than reusing an existing icon.**
None of the existing icons (`CloseIcon`, `PlayIcon`, `RefreshIcon`, `CheckIcon`) represent audio state. Two small SVGs (speaker-on / speaker-off) follow the same `currentColor`-stroke convention as the existing icons, so the existing `.btn-icon` / `.btn-icon--inverted` color machinery (and `--color-accent`) apply without new CSS.

**Top bar layout: a new scoped `.dialog-topbar` wrapper class, not a change to the shared `.quiz-topbar` class.**
`.quiz-topbar` is used identically by `ListeningPracticeScreen` (just the close button, right-aligned) and `DialogPracticeScreen`. Rather than changing that shared class's `justify-content` (which would need re-verifying every other screen that reuses it), `DialogPracticeScreen` renders a new `DialogTopBar` component with its own `.dialog-topbar` wrapper (`space-between`, containing the speaker button and the existing `TopBarCloseButton`). `ListeningPracticeScreen` and the shared `.quiz-topbar` class are untouched by this change - guaranteed by construction, not just by visual check.

**Read the toggle through a ref inside `useDialogSession`, not as a direct `useCallback` dependency.**
`beginTurn` (and everything downstream of it: `enterPlanIndex`, `start`) previously took `nativeLanguage` as its only reactive dependency besides `startDeadline`. Adding `nativeAudioEnabled` directly to that dependency array made `start`'s identity change on every toggle click; `DialogPracticeScreen`'s `useEffect(() => { if (dialog) start() }, [dialog, start])` then re-fired on every toggle and restarted the whole dialog from turn 0 — caught during manual verification. Fixed by storing the value in `nativeAudioEnabledRef` (synced via its own effect, mirroring `currentTurnRef`/`manifestEntryRef`) and reading `nativeAudioEnabledRef.current` inside `beginTurn`, which keeps `beginTurn`'s identity stable across a toggle. The toggle still only takes effect from the next `beginTurn` call (see the mid-turn risk below), which was always the intended behavior — this only removes the unintended full restart.

## Risks / Trade-offs

- [Toggling mid-turn while native audio is already playing] -> Out of scope for this change to special-case: the toggle takes effect from the next time `beginTurn` evaluates the branch (i.e., the next learner turn). Mid-playback toggling does not retroactively stop an already-started recording. This matches how other Dialogi settings (e.g., which dialog is selected) are not expected to interrupt an in-flight turn.
- [Two near-identical icon SVGs to maintain] -> Small, self-contained, follows existing icon file conventions; low ongoing cost.

## Migration Plan

No data migration. New `localStorage` key defaults to `false` when absent, matching "default off" for all existing users on first load after the update. No rollback concerns beyond a normal code revert.
