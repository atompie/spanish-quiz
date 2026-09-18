## Context

Today `App.tsx` holds a flat `screen: 'quiz' | 'verbs' | 'settings'` state (see
`src/components/layout/NavBar.tsx`). `screen === 'verbs'` renders `VerbsListScreen` directly. The
app already has a precedent for tab-scoped drill-down: `DialogPracticeScreen` keeps its own
`dialog: string | null` state and renders `DialogPicker` vs. the active dialog stage internally,
and `App.tsx` already resets the "quiz" tab's sub-state (`showQuizPicker`) when that tab is
re-selected. The `'verbs'` screen id is not persisted anywhere (checked `storage.ts` and
`useSessionContinuity`), so renaming it is safe. See proposal.md - Why / What Changes.

## Goals / Non-Goals

**Goals:**
- Reuse the existing drill-down pattern (tab owns a nullable sub-state) rather than introducing a
  new navigation abstraction (e.g. a router).
- Make adding a second category (e.g. Nouns) a data + component change only.

**Non-Goals:**
- Implementing any category besides Verbs.
- A generic/nested router; one level of drill-down is all this needs.
- Changing verb list, search, or explanation-modal behavior.

## Decisions

- **Category registry as a static array in `src/data/vocabularyCategories.ts`**, matching the
  existing `data/verbTypes.ts` convention:
  ```ts
  export type VocabularyCategoryId = 'verbs'
  export interface VocabularyCategory {
    id: VocabularyCategoryId
    labelKey: keyof UiStrings // e.g. 'vocabCategoryVerbs'
    descriptionKey: keyof UiStrings // e.g. 'vocabCategoryVerbsDescription'
  }
  export const VOCABULARY_CATEGORIES: VocabularyCategory[] = [
    { id: 'verbs', labelKey: 'vocabCategoryVerbs', descriptionKey: 'vocabCategoryVerbsDescription' },
  ]
  ```
  `VocabularyScreen` maps `selectedCategory` to its screen component with a small switch; adding
  Nouns later means one array entry, one `labelKey` translation, one case in that switch — no
  changes to `NavBar`, `App.tsx`, or the reset-on-reselect behavior.
  Alternative considered: inline the single category without a registry array, add the array only
  when a second category is actually added. Rejected because the proposal's explicit acceptance
  criterion is that adding a category needs no rework of the "Vocabulary" mechanism, and the
  registry costs one small file now versus a later refactor under time pressure.

- **`VocabularyScreen` owns `selectedCategory: VocabularyCategoryId | null` locally**, mirroring
  `DialogPracticeScreen`'s `dialog: string | null`. `null` renders the category list;
  non-null renders that category's screen. This keeps `App.tsx`'s top-level `Screen` union
  unchanged in shape (still three tabs), just renamed `'verbs'` → `'vocabulary'`.

- **Reset-on-reselect reuses the existing pattern**: `App.tsx`'s `handleScreenChange` already
  special-cases `next === 'quiz'` to reset `showQuizPicker`. Add a matching branch,
  `if (next === 'vocabulary') setVocabularySelectedCategory(null)` — hoisting the sub-state
  from `VocabularyScreen` into `App.tsx` so it can be reset from `handleScreenChange`,
  the same shape it already uses for `selectedVerbId`.

- **Back button reuses `TopBarCloseButton`**, the same component already used by
  `QuizScreen`/`DialogTopBar`, placed above `VerbsListScreen` when rendered from
  `VocabularyScreen`. `VerbsListScreen` itself is unchanged; the button and its `onClose` (which
  sets `selectedCategory` back to `null`) live in `VocabularyScreen`, not inside
  `VerbsListScreen`, so the verb list stays reusable outside the vocabulary flow if needed later.

- **Icon**: keep `VerbsIcon` as the nav icon (rename not required by any acceptance criterion;
  the book icon already reads as "vocabulary/reading" generically).

- **Category list is styled as `quiz-kind-picker`/`quiz-kind-option` cards**, the same title +
  description card style already used by the quiz-kind picker and `DialogPicker` (a "list of
  choices leading to a sub-flow" pattern), rather than the flat `verb-list` row style used inside
  a single category's list. This keeps the category-selection step visually consistent with the
  app's other top-level choice screens; the per-category description (`descriptionKey`) is new
  data needed to fill that card format. `VerbsListScreen`'s own `verb-list` styling (the list of
  individual verbs *within* the Verbs category) is unchanged — the two styles serve different
  levels of the hierarchy: category picker vs. item list.

## Risks / Trade-offs

- [Extra tap to reach the verb list] Existing users go from one tap (Verbs) to two (Vocabulary →
  Verbs). Mitigated by this being the explicit, accepted point of the change (room for future
  categories); no further mitigation planned.
- [Registry adds indirection for a single entry] A one-item array plus a switch is slightly more
  code than a direct render for the current single-category state. Accepted per the "Decisions"
  rationale above — the alternative was explicitly considered and rejected.
