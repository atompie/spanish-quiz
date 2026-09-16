## 1. Lesson id parsing

- [x] 1.1 Extend `LESSON_LEVEL_PATTERN` in `src/lib/listeningSession.ts` to accept an optional second `.<M>` segment and add `subsequence` to the `LessonLevel` interface; verify `parseLessonLevel('lesson_A1.1.1')` returns `{ level: 'A', sublevel: 1, sequence: 1, subsequence: 1 }` and `parseLessonLevel('lesson_A1.1')` still returns `subsequence: 0`.

## 2. Sorting

- [x] 2.1 Update `getAvailableLessons` in `src/lib/listeningSession.ts` to break ties on `subsequence` after `sequence`; verify a unit test that sorting `['lesson_A1.2', 'lesson_A1.1.2', 'lesson_A1.1', 'lesson_A1.1.1']` produces `['lesson_A1.1', 'lesson_A1.1.1', 'lesson_A1.1.2', 'lesson_A1.2']`.

## 3. Labeling

- [x] 3.1 Update `lessonLabel` in `src/lib/listeningSession.ts` to append the sub-sequence when present; verify `lessonLabel('lesson_A1.1.1', 'Lesson')` returns `'Lesson A1.1.1'` and `lessonLabel('lesson_A1.1', 'Lesson')` still returns `'Lesson A1.1'`.

## 4. Verification

- [x] 4.1 Run the existing test suite covering `src/lib/listeningSession.ts` (parsing, sorting, labeling) and confirm all scenarios from the `listening-lessons` spec delta pass, including the new sub-lesson scenarios.
- [x] 4.2 Verified against the real, already-staged `lesson_A1.1.1/ser` and `lesson_A1.1.2/estar` sub-lesson audio in `public/speak/`: regenerated the manifest via `scripts/generate-speak-manifest.ts`, confirmed both entries appear in `manifest.json`, and confirmed `getAvailableLessons`/`lessonLabel` place and label them as `lesson_A1.1`, `lesson_A1.1.1`, `lesson_A1.1.2`, `lesson_A1.2` / "Lesson A1.1.1", "Lesson A1.1.2".
