## 1. Persistence

- [x] 1.1 Add `dialogNativeAudioEnabled` key + `loadDialogNativeAudioEnabled`/`saveDialogNativeAudioEnabled` helpers to `src/lib/storage.ts`, following the existing `theme` key pattern, default `false`, and verify with a unit test that a missing key loads as `false` and a saved value round-trips.

## 2. Icons

- [x] 2.1 Add `SpeakerOnIcon` and `SpeakerOffIcon` components under `src/components/common/`, following the existing `currentColor`-stroke SVG convention (see `CloseIcon.tsx`, `PlayIcon.tsx`), and verify they render without console errors in the dialog screen.

## 3. i18n

- [x] 3.1 Add aria-label/title translation keys for both toggle states (enable/disable native-language audio) to `src/i18n/types.ts` and all translation files (`pl.ts`, `en.ts`, `de.ts`), and verify the type-checker reports no missing keys.

## 4. Session logic

- [x] 4.1 Thread a `nativeAudioEnabled: boolean` parameter into `useDialogSession` and update the learner-turn branch in `beginTurn` (`src/hooks/useDialogSession.ts`) so it only enters `'native-playing'` when `nativeAudioEnabled && hasRecording(...)`, otherwise `'native-wait-fallback'` — and verify with a unit test (alongside existing tests in `src/lib/dialogSession.test.ts` or a new `useDialogSession` test) that a learner turn with a native-language recording present but `nativeAudioEnabled: false` takes the fallback path with word-count timing, while Spanish (`target-playing`) playback is unaffected.

## 5. UI

- [x] 5.1 In `DialogPracticeScreen.tsx`, load the persisted setting on mount, add a speaker toggle button (using `SpeakerOnIcon`/`SpeakerOffIcon`, colored via the existing `--color-accent` active-state styling) to the left of the existing `TopBarCloseButton` in the top bar, wired to save on change and to the `nativeAudioEnabled` value passed into `useDialogSession`.
- [x] 5.2 Add a new scoped `.dialog-topbar` wrapper class in `src/index.css` (space-between layout) instead of modifying the shared `.quiz-topbar` class, so the speaker button renders at the opposite end from the close button in Dialogi while `ListeningPracticeScreen`'s `.quiz-topbar` usage is structurally untouched — confirmed by code review and by the user's live check in their own browser.

## 6. Verification

- [x] 6.1 Run the full test suite (`npm test` or project's equivalent) and confirm it passes.
- [x] 6.2 Manually run the Dialogi course with the toggle off (default): confirmed by the user live — no doubled wait, native-language text shown, Spanish audio unaffected.
- [x] 6.3 Manually toggle the setting on/off and confirm it takes effect without restarting the dialog, and persists — confirmed by the user live (this surfaced and led to fixing the restart-on-toggle bug and the doubled-countdown bug, both now fixed and re-confirmed).
- [x] 6.4 Manually check the marked/unmarked icon-button styling in both themes — confirmed by the user live (this iterated through a few marking/icon-polarity corrections, now settled: enabled = marked).
