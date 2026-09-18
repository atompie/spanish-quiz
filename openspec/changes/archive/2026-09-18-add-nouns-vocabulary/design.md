## Context

See proposal.md - Why. Two existing patterns already live in this codebase and this change picks
one deliberately instead of following the nearer neighbor:
- Verbs (`src/data/verbs.ts`): data bundled as TypeScript source, imported directly.
- Lessons/dialogs (`public/speak/metadata.json`, `public/dialog/metadata.json`): data fetched at
  runtime from `public/`, loaded via a dedicated hook (`useSpeakLessons`, `useDialogLessons`) with
  `null`-while-loading / `hasError` / empty-list states.

Empty placeholder directories `public/vocabulary/nouns/` and `public/vocabulary/verbs/` already
exist in the repo, ahead of this change, confirming the runtime-data location.

## Goals / Non-Goals

**Goals:**
- Nouns are editable by adding/editing JSON under `public/vocabulary/nouns/`, without a rebuild.
- Reuse the existing runtime-metadata loading shape (hook + loading/error/empty states) rather than
  inventing a new one.

**Non-Goals:**
- No quiz for nouns in this change (deferred; would need `QuizKind`, `QuizQuestion`, question
  generator, and settings screen changes not covered here).
- No `manifest.json` for nouns: unlike `speak`/`dialog`, nouns have no per-item generated folder
  (audio files) to discover, so `metadata.json` alone is the complete data source.
- No migration of the existing verb data to the runtime-metadata pattern; verbs keep their current
  bundled-source format.

## Decisions

**Runtime JSON over bundled TypeScript.** The user asked for the noun list to live under
`public/vocabulary/nouns/`, matching the lesson/dialog pattern rather than the verb pattern. This
trades compile-time type checking of the data for edit-without-rebuild, consistent with how lesson
content already works. Alternative considered: keep nouns as a `src/data/nouns.ts` array like verbs
— rejected per explicit direction to place it under `public/`.

**Plain object keyed by id, no array wrapper.** Matches `DialogMetadata`'s
`{ [id: string]: {...} }` shape rather than an array, so a hand-edited file can add one entry
without touching a surrounding array structure, and lookup by id is direct.

**Spanish form grouped under an `es` key, sibling to per-language meanings.** Each noun entry is
`{ es: { singular, article, plural }, pl: { singular }, en: { singular }, ... }` — every language
key (`es` included) holds that language's singular form, with `es` additionally carrying the
grammatical data (article, plural) that only the Spanish form needs. This reads as one consistent
per-language shape instead of splitting "the Spanish word" and "its translations" into differently
shaped top-level fields. On load, `useNouns` destructures `es` out of each entry and keeps the
remaining language keys as `translations`, so the rest of the code (`getNounTranslation`,
`pickTranslation`) is unchanged from the verb/example pattern.

**Plural article derived by default, with a stored override for euphonic exceptions.** `los`/`las`
follows deterministically from `article` (`el`/`la`) for almost every noun, so storing it would
usually be redundant data that could drift from `article`. But a handful of feminine nouns (e.g.
"agua", "águila", "área") take `el` in the singular purely for euphony (avoiding "la agua"'s vowel
clash), and their plural is always `las`, never the derived `los` — confirmed by testing "el agua"
against the live noun list and observing the wrong derived form ("los aguas"). `NounSpanish` gained
an optional `pluralArticle` field: absent for the regular case (derive as before), explicitly set to
`las` for this exception set. This keeps the common case free of redundant data while fixing the
exception, rather than either hardcoding a euphonic-detection heuristic (fragile: depends on stress
and the following letter, not a simple prefix check) or storing the plural article for every noun
(defeats the point of deriving it for the ~95% regular case).

**Dedicated `NounExplanationModal` instead of extending `ExplanationModal`.** The existing
`ExplanationModal` is built around tense navigation (prev/next tense, conjugation table per person)
that has no noun equivalent. A small dedicated modal (article + plural + meaning, no navigation
state) is simpler than threading noun-shaped optional props through the verb modal.

**No `manifest.json` for nouns.** `speak`/`dialog` need a manifest because their content is
generated per-lesson/per-dialog folders of audio files that must be discovered (glob of what
exists). Nouns have no generated per-item assets — `metadata.json`'s own keys are the full list —
so a manifest would be a redundant indirection.

## Risks / Trade-offs

- [No compile-time validation of `metadata.json` shape] → Mirrors the accepted risk already taken
  for `speak`/`dialog` metadata; a malformed entry fails at runtime (caught by the existing
  try/fetch/catch → `hasError` pattern) rather than at build time. Acceptable since this matches
  existing precedent and the file is hand-edited by the project owner, not user-submitted.
- [Two different storage strategies for vocabulary categories (verbs: bundled source, nouns:
  runtime JSON) may look inconsistent to a future contributor] → Documented here and in the
  proposal's Impact section; each category is free to pick the pattern it needs, and Non-Goals
  explicitly rules out migrating verbs.

## Migration Plan

No data migration — this is new data. Deployment is a normal release: ship the new
`public/vocabulary/nouns/metadata.json`, the new components/hook, and the `vocabularyCategories.ts`
entry together. Rollback is deleting/reverting those files; no existing behavior is removed.
