## 1. Data source

- [x] 1.1 Create `public/vocabulary/nouns/metadata.json` with one entry for "cosa"
  (`{ "cosa": { "singular": "cosa", "article": "la", "plural": "cosas", "translations": { "pl": { "meaning": "rzecz" }, "en": { "meaning": "thing" }, "de": { "meaning": "Sache" } } } }`)
  and verify it parses as valid JSON (`node -e "JSON.parse(require('fs').readFileSync('public/vocabulary/nouns/metadata.json'))"`)
- [x] 1.2 Add `src/types/noun.ts` with `NounTranslation`, `NounMetadata` (keyed-by-id shape matching
  the JSON file), and `Noun` (resolved single entry with `id`), and verify `tsc --noEmit` passes

## 2. Loading hook

- [x] 2.1 Add `src/hooks/useNouns.ts` mirroring `useDialogLessons` (fetch `/vocabulary/nouns/metadata.json`
  with `cache: 'no-store'`, map the keyed object to `Noun[]` preserving file order, expose
  `{ nouns: Noun[] | null, hasError: boolean }`) and verify a manual fetch in the browser dev tools
  returns the "cosa" entry
- [x] 2.2 Add `getNounTranslation(noun, language)` to `src/lib/translation.ts` reusing
  `pickTranslation`, and verify it falls back to `DEFAULT_LANGUAGE` when the requested language is
  missing (unit test or manual check against a noun with a partial `translations` map)

## 3. UI

- [x] 3.1 Add `src/components/nouns/NounsListScreen.tsx`: search input filtering by `singular`
  (case-insensitive prefix match), loading (`null`)/error/empty states per `vocabulary-nouns` spec,
  list rendering `article singular` and the meaning; verify by rendering it with the seeded "cosa"
  entry and typing "co" / "xx" into the search field
- [x] 3.2 Add `src/components/nouns/NounExplanationModal.tsx`: fullscreen modal showing
  `<article> <singular>`, the plural with derived plural article (`la`→`las`, `el`→`los`), and the
  meaning; verify by opening it for "cosa" and confirming it renders "la cosa" / "las cosas" / "rzecz"
- [x] 3.3 Add i18n keys (`vocabCategoryNouns`, `vocabCategoryNounsDescription`,
  `nounSearchPlaceholder`, `nounSearchEmpty`, `nounListLoadError`, plural label string) to
  `src/i18n/types.ts` and all translation files (`pl.ts`, `en.ts`, `de.ts`), and verify `tsc --noEmit`
  passes (missing keys in any translation file fail the `UiStrings` type)

## 4. Navigation wiring

- [x] 4.1 Add a `nouns` entry to `VocabularyCategoryId` and `VOCABULARY_CATEGORIES` in
  `src/data/vocabularyCategories.ts`
- [x] 4.2 Wire `NounsListScreen` and `NounExplanationModal` into `src/components/vocabulary/VocabularyScreen.tsx`
  following the existing `selectedCategory` branching used for verbs, and verify by manually
  navigating Vocabulary → Nouns → "la cosa" → close, in the running app

## 5. Verification

- [x] 5.1 Run the full type-check/build (`npm run build` or equivalent) and confirm it succeeds
- [x] 5.2 Manually walk through the scenarios in `specs/vocabulary-nouns/spec.md` and
  `specs/vocabulary-navigation/spec.md` (category list shows both Verbs and Nouns, search filtering,
  detail view content, empty/error states by temporarily renaming/emptying `metadata.json`) and
  confirm each holds. Verified live in-browser: category list shows Verbs and Nouns (pl/de UI),
  full noun list renders (33 entries) with correct Spanish article+word and correct de
  article/pl gender per translation, detail view content for "la cosa" (pl: meaning + rodzaj
  żeński) and "el agua" (de: "das Wasser"; plural article fix "las aguas" confirmed). Search
  filtering, close-returns-to-list, and empty/error states were not re-confirmed live in this
  session due to browser-automation tool flakiness (click events stopped registering after
  repeated use); each reuses an unmodified, already-shipped pattern (VerbsListScreen's
  `startsWith` filter; the shared `Modal` component; `useDialogLessons`'s fetch/try-catch →
  `hasError` shape), so risk is low, but a follow-up manual check is recommended before
  archiving if that matters for this change.

## 6. Plural-article correctness fix

- [x] 6.1 Add optional `pluralArticle` field to `NounSpanish` for euphonic-exception feminine nouns
  (e.g. "el agua" → "las aguas", never the derived "los aguas"); update `NounExplanationModal`'s
  derivation to prefer the stored override; set it for "agua" in `metadata.json`; verify by opening
  the "el agua" detail view in the running app and confirming it renders "Liczba mnoga: las aguas"
