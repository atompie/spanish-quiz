## Why

The Vocabulary section currently supports only one category, Verbs. Nouns are the next natural
category: unlike verbs they don't conjugate, so a learner only needs to know the gender article
(`el`/`la`) and the plural form to use one correctly. Adding a "Nouns" category lets learners browse
and check these two facts per noun.

## What Changes

- Add a "Nouns" category to the Vocabulary category list, alongside the existing "Verbs" category.
- Add a nouns list screen (with search, mirroring the existing verb list) that opens a detail view
  per noun showing the article, singular form, plural form, and the meaning in the learner's UI
  language.
- Store the noun list as runtime data at `public/vocabulary/nouns/metadata.json` (one JSON object
  keyed by noun id), fetched at runtime the same way `public/dialog/metadata.json` and
  `public/speak/metadata.json` are — not bundled as source code like the existing verb list.
- Ship a first entry in that data file: "la cosa" (article `la`, plural `cosas`).

## Capabilities

### New Capabilities
- `vocabulary-nouns`: Defines the noun data shape (id, article, singular, plural, per-language
  meaning), how it's loaded from `public/vocabulary/nouns/metadata.json` at runtime, and the list/
  detail UI for browsing nouns.

### Modified Capabilities
- `vocabulary-navigation`: The vocabulary category list requirement currently states the first
  version includes exactly one category, "Verbs". This changes to include "Nouns" as a second
  selectable category, with the same back/reset navigation behavior already specified for
  categories.

## Impact

- New: `src/types/noun.ts`, `src/hooks/useNouns.ts`, `src/components/nouns/NounsListScreen.tsx`,
  `src/components/nouns/NounExplanationModal.tsx`, `public/vocabulary/nouns/metadata.json`.
- Modified: `src/data/vocabularyCategories.ts` (add `nouns` entry), `src/components/vocabulary/VocabularyScreen.tsx`
  (route to the nouns screen), `src/lib/translation.ts` (add `getNounTranslation`), i18n translation
  files (new UI strings for the category label/description, search placeholder/empty state, plural
  label).
- No changes to existing verb code, quiz types, or the verb data format.
