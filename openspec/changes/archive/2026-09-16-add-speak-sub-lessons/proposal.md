## Why

Some Speak/Listening lessons cover enough ground that the material benefits from being split into smaller, separately trackable units (e.g. `A1.1` split into `A1.1.1`, `A1.1.2`, ...), without renumbering every later lesson in the sequence. The current lesson id pattern only allows a single `.N` sequence segment, so a sub-lesson id like `lesson_A1.1.1` sorts and labels incorrectly.

## What Changes

- Extend the lesson id pattern to accept an optional second `.N` segment (`lesson_<LEVEL><1|2>(.<N>)?(.<M>)?`), e.g. `lesson_A1.1.1`.
- Extend sort order to break ties on the new sub-sequence number after level, sublevel, and sequence, so `lesson_A1.1.1` and `lesson_A1.1.2` sort between `lesson_A1.1` and `lesson_A1.2`.
- Extend the friendly label to render the sub-sequence when present (e.g. `lesson_A1.1.1` -> "Lesson A1.1.1"), instead of falling back to the raw id.
- Sub-lessons are optional: a lesson id with no sub-sequence behaves exactly as today. No existing lesson ids or files need to change.
- No UI restructuring: sub-lessons remain flat entries in the existing lesson list, not nested/grouped under their parent.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `listening-lessons`: lesson id pattern, sort order, and label derivation extended to support an optional sub-lesson sequence segment.

## Impact

- `src/lib/listeningSession.ts`: `LESSON_LEVEL_PATTERN`, `LessonLevel`, `parseLessonLevel`, `lessonLabel`, `getAvailableLessons`.
- No changes needed to `scripts/speakManifestGenerator.ts` (naming-agnostic directory scan) or `src/components/listening/LessonPicker.tsx` (already renders a flat list).
- Dialogi (`useDialogLessons.ts`) is unaffected — it does not use this CEFR id/sort scheme.
