## Why

In the "Dialogi" course, the learner's native-language recording is always played on every learner turn. That automatic playback can pull the learner out of rhythm and is not always helpful for learning: often the translation text alone is enough, and hearing it read aloud is a nice-to-have rather than a default.

## What Changes

- Add a speaker icon to the Dialogi practice screen's top bar (to the left of the existing close/X button) that toggles whether the native-language recording is played on learner turns.
- The icon shows the current state: active (audio plays) vs. inactive (audio does not play), with active color following the theme (black in light theme, white in dark theme, using the existing `--color-accent` token).
- The setting persists across sessions (like the existing `theme` setting) and defaults to **off**.
- When off, the native-language recording for a learner turn is never loaded or played; only the native-language text is shown, timed by the existing missing-recording word-count fallback formula (`clamp(0.6 * wordCount + 1, 2, 15)`).
- The Spanish-language recording (native-speaker turns, and the answer step of learner turns) is never affected by this toggle — it always plays.
- The learner can toggle the setting at any time from the top bar.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `dialog-course`: adds a learner-controlled, persisted toggle for native-language audio playback on learner turns, defaulting to off, and changes the "Learner turn playback" / "Length-based translation countdown" / "Missing-recording fallback" requirements so that native-language playback is conditional on this setting rather than solely on recording availability.

## Impact

- `src/hooks/useDialogSession.ts`: gate the `native-playing` vs. `native-wait-fallback` branch in `beginTurn` on the new setting, in addition to recording availability.
- `src/components/dialog/DialogPracticeScreen.tsx`: render the new speaker toggle button in the top bar area.
- `src/lib/storage.ts`: add load/save helpers for the new persisted setting (parallel to the existing `theme` key).
- New icon components for the active/inactive speaker states.
- New i18n labels (aria-label/title for both icon states) in `pl`/`en`/`de` translations.
- No change to Spanish-audio playback, pacing formulas' definitions, or any other quiz kind.
