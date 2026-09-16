## 1. Data type

- [x] 1.1 Add an optional `title` field to `SpeakMetadata` in `src/types/speak.ts` (`Partial<Record<LanguageCode, string>>`) and verify `tsc`/build has no type errors against the existing `public/speak/metadata.json` (including `lesson_A1.1.1`'s existing `title.pl`).

## 2. Title resolution helper

- [x] 2.1 Add a helper in `src/lib/listeningSession.ts` that resolves a lesson's title for a given native language: `metadata[lesson].title?.[nativeLanguage]` if present, else the first key of `metadata[lesson].parts`, else `null`. Verify with a unit test covering: title present for the language, title object present but missing that language, and no title at all.

## 3. In-session title display

- [x] 3.1 Expose the resolved lesson title from `useListeningSession.ts` alongside `currentText`, using the lesson/metadata/nativeLanguage already held in that hook's state.
- [x] 3.2 Render the title in `ListeningStage.tsx` above the countdown/counter, wiring it through from `ListeningPracticeScreen.tsx`. Verify manually in the dev server: start a session for `lesson_A1.1.1` (has `title.pl`) and confirm the title shows above the counter with a `pl` native language; start a session for a lesson without a title and confirm the first `parts` key shows instead.

## 4. Lesson picker description

- [x] 4.1 In `LessonPicker.tsx`, prefer the resolved title (for the learner's native language) over `getLessonTopicWord` when building the description line; keep `getLessonTopicWord` as the fallback when no title exists for that language. Verify manually: `lesson_A1.1.1` shows its title in the picker with `pl` selected, while other lessons show the unchanged topic-word description.

## 5. Verification

- [x] 5.1 Run the existing test suite and confirm no regressions.
- [x] 5.2 Manually exercise both display points with a native language other than `pl` (e.g. `en`) and confirm `lesson_A1.1.1` falls back to the first `parts` key / topic word rather than showing the Polish title.
