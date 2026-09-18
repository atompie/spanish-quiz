## 1. Translations

- [x] 1.1 In `src/i18n/types.ts`, rename `navVerbs` to `navVocabulary` and add `vocabCategoryVerbs`; verify `tsc` reports the now-missing keys in each translation file
- [x] 1.2 Update `src/i18n/translations/en.ts`, `de.ts`, `pl.ts` with `navVocabulary` ("Vocabulary"/"Vokabular"/"Słownictwo") and `vocabCategoryVerbs` ("Verbs"/"Verben"/"Czasowniki"); verify `tsc --noEmit` passes with no missing-key errors

## 2. Category registry

- [x] 2.1 Create `src/data/vocabularyCategories.ts` exporting `VocabularyCategoryId`, `VocabularyCategory`, and `VOCABULARY_CATEGORIES` (single `'verbs'` entry per design.md); verify it type-checks and is importable

## 3. Vocabulary screens

- [x] 3.1 Create `src/components/vocabulary/VocabularyCategoryList.tsx` rendering `VOCABULARY_CATEGORIES` as selectable cards styled like the existing `quiz-kind-picker`/`quiz-kind-option` cards (title + description, same as the quiz-kind and dialog pickers), each category carrying a `descriptionKey` alongside `labelKey`; verify it renders the "Czasowniki"/"Verbs" card via a manual run
- [x] 3.2 Create `src/components/vocabulary/VocabularyScreen.tsx` owning `selectedCategory` (or receiving it as controlled state per design.md), rendering `VocabularyCategoryList` when null and `VerbsListScreen` + `TopBarCloseButton` + `ExplanationModal` when `'verbs'`; verify selecting "Czasowniki" shows the verb list and the back button returns to the category list

## 4. Wire into App and NavBar

- [x] 4.1 In `src/components/layout/NavBar.tsx`, rename the `Screen` union member `'verbs'` to `'vocabulary'` and update the tab's label to `t.navVocabulary`; verify the bottom nav shows "Słownictwo" in Polish
- [x] 4.2 In `src/App.tsx`, replace the `screen === 'verbs'` branch with `screen === 'vocabulary'` rendering `VocabularyScreen`, move `selectedVerbId`/`ExplanationModal` handling into that branch as needed, and reset the vocabulary sub-state when `'vocabulary'` is re-selected (mirroring the existing `showQuizPicker` reset for `'quiz'`); verify re-tapping "Słownictwo" from inside the verb list returns to the category list

## 5. Verification

- [x] 5.1 Run the app locally, walk Menu → Słownictwo → Czasowniki → verb detail → back → re-tap Słownictwo, and confirm existing verb search/explanation behavior is unchanged
- [x] 5.2 Run `npm run lint` and `npm run build` (or project equivalents) and verify both succeed
