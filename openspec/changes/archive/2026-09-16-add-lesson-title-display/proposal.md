## Why

Listening lessons are currently identified only by their raw level id (e.g. "Lesson A1.1.1") both in the lesson picker and during the session itself. `metadata.json` already supports an optional per-language `title` field (used once, on `lesson_A1.1.1`), but nothing in the code reads it. Surfacing a real lesson title makes it easier for the learner to recognize what a lesson is about, both when choosing a lesson and while practicing it.

## What Changes

- Add an optional `title` field (`{ [languageCode]: string }`) to the `SpeakMetadata` type so it is recognized as first-class lesson data, not just incidental JSON.
- During an active listening session, display the lesson title above the countdown/counter in the practice stage (`ListeningStage`). If no title exists for the learner's native language, fall back to the first key of that lesson's `parts` map.
- In the lesson picker list, replace the current topic description (`getLessonTopicWord`, derived from the first Spanish sentence) with the lesson's `title` for the learner's native language when available. If no title exists for that language, keep the existing topic-word behavior unchanged.
- Neither fallback performs cross-language lookup: a title only counts if it exists for the learner's *current* native language.
- Authoring the remaining Polish titles for the other 21 lessons in `metadata.json` is explicitly out of scope for this change and will be done later.

## Capabilities

### Modified Capabilities
- `listening-lessons`: adds a requirement for how a lesson's display title is derived and shown, both in the lesson picker and during an active session, including the fallback behavior when no title is authored for the learner's native language.

## Impact

- `src/types/speak.ts` — extend `SpeakMetadata` with an optional `title` field.
- `src/lib/listeningSession.ts` — new helper to resolve a lesson's title with fallback to the first `parts` key; `LessonPicker`'s description logic changes to prefer `title` over `getLessonTopicWord`.
- `src/hooks/useListeningSession.ts` — expose the resolved lesson title alongside existing session state.
- `src/components/listening/ListeningStage.tsx` — render the title above the counter.
- `src/components/listening/LessonPicker.tsx` — use the title (with existing fallback) in the description line.
- `public/speak/metadata.json` — no content changes in this task; only `lesson_A1.1.1` has a `title` today, which is enough to exercise both the "title present" and "title absent" paths.
