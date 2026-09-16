## 1. Directory and data migration

- [x] 1.1 `git mv` the 19 remaining lesson directories under `public/speak/` per the mapping in proposal.md (`lesson_1`->`lesson_A1.1`, ..., `lesson_22`->`lesson_A1.19`) and verify `git status` shows each as a rename, not a delete+add
- [x] 1.2 Rename the matching 19 top-level keys in `public/speak/metadata.json` to the new lesson ids and verify the file still parses as valid JSON (e.g. `node -e "require('./public/speak/metadata.json')"`)
- [x] 1.3 Regenerate `public/speak/manifest.json` by running the existing generator (`scripts/generate-speak-manifest.ts`, or starting the dev server) and verify every entry's `lesson` field matches one of the new directory names, with none of the old `lesson_<N>` names remaining
- [x] 1.4 Cross-check that every `lesson` value in `manifest.json` has a matching top-level key in `metadata.json` (e.g. diff the two key sets) and fix any mismatch before proceeding

## 2. Lesson id parsing

- [x] 2.1 Add a shared `parseLessonLevel()` helper in `src/lib/listeningSession.ts` matching `/^lesson_([ABC])([12])(?:\.(\d+))?$/` and returning level/major/minor parts, or `null` when unmatched
- [x] 2.2 Add a unit test (or extend existing tests for `listeningSession.ts`) covering: a matching CEFR id, an id with no `.N` suffix, and a non-matching legacy/unknown id returning `null`

## 3. Sorting

- [x] 3.1 Update `getAvailableLessons()` in `src/lib/listeningSession.ts` to sort using `parseLessonLevel()` (level letter, then sublevel digit, then sequence number), keeping the existing purely-numeric-id sort as a fallback ordered before any CEFR-shaped id
- [x] 3.2 Add/extend a test verifying `lesson_A1.2` sorts before `lesson_A1.10`, and that A1-level lessons sort before B1-level lessons

## 4. Display label

- [x] 4.1 Update `lessonLabel()` in `src/components/listening/LessonPicker.tsx` to use `parseLessonLevel()` and render `"${lessonLabelText} ${level}${major}${'.' + minor if present}"`, keeping the raw-id fallback for unmatched ids
- [x] 4.2 Add/extend a test (or manual verification via `npm run dev`) confirming a lesson with id `lesson_B1.1` renders the label `"Lesson B1.1"` (not `"lesson_B1.1"`), and `lesson_A1.1` renders `"Lesson A1.1"`

## 5. Verification

- [x] 5.1 Run the project's lint/typecheck/test scripts and verify they pass
- [x] 5.2 Start the app (`npm run dev`) and manually confirm the Listening lesson list shows `"Lesson A1.1"` through `"Lesson A1.19"` followed by `"Lesson B1.1"`, in that order, and that selecting each of a few sampled lessons plays audio correctly
- [x] 5.3 Confirm `git status` shows a clean set of changes (19 directory renames, `metadata.json` and `manifest.json` updates, two source file edits) with no stray old `lesson_<N>` paths left under `public/speak/`
