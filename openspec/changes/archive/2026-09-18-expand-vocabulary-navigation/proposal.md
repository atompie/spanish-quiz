## Why

The main menu currently has a "Verbs" entry that jumps straight to the verb list. The app will
grow to cover more word categories (nouns, adjectives, ...), and a flat "Verbs" entry has no room
for that. Replacing it with a "Vocabulary" section that lists categories lets new categories be
added later without reworking the top-level navigation.

## What Changes

- Rename the "Verbs" bottom-nav entry to "Vocabulary" ("Słownictwo" in Polish).
- Selecting "Vocabulary" opens a new category-list screen instead of the verb list directly.
- The category list ships with a single entry, "Verbs", which opens the existing (unchanged) verb
  list and explanation modal.
- Category list reached from "Vocabulary" is defined as a small, extensible registry so a future
  category (e.g. "Nouns") can be added as one data entry plus one screen component, without
  touching the top-level navigation mechanism.
- Re-selecting the "Vocabulary" tab while already inside a category resets back to the category
  list (same behavior already used by the "Quiz" tab, which resets to its kind picker).
- The verb list, when reached through "Vocabulary" → "Verbs", gets a back button (reusing the
  existing `TopBarCloseButton` pattern already used by the quiz/dialog screens) to return to the
  category list.

## Capabilities

### New Capabilities
- `vocabulary-navigation`: defines the Vocabulary section's menu entry, its category list, and the
  extensible category registry, including the Verbs category as the first entry.

### Modified Capabilities
(none — `verb-conjugation` covers verb data/quiz behavior, which is unchanged; only how the
existing verb list screen is reached changes, which is navigation, not verb-conjugation behavior)

## Impact

- `src/components/layout/NavBar.tsx`, `NavIcons.tsx`: rename `'verbs'` screen id to `'vocabulary'`,
  update label.
- `src/App.tsx`: route `'vocabulary'` screen to a new `VocabularyScreen`, reset its sub-state on
  re-selecting the tab.
- New: `src/components/vocabulary/VocabularyScreen.tsx`,
  `src/components/vocabulary/VocabularyCategoryList.tsx`,
  `src/data/vocabularyCategories.ts`.
- `src/components/verbs/VerbsListScreen.tsx`: unchanged behavior, gains a back button when hosted
  inside the vocabulary flow.
- `src/i18n/types.ts` and `src/i18n/translations/{en,de,pl}.ts`: rename `navVerbs` to
  `navVocabulary`, add a new `vocabCategoryVerbs` string for the category label.
