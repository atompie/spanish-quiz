## Why

The verb database only covers presente, pretérito indefinido, futuro simple, and two periphrastic
tenses — it has no imperativo (command forms) and no gerundio, both core pieces of Spanish grammar
a learner needs early (e.g. "¡Anda!", "No andes tan rápido", "Está andando"). Adding "andar" and
"quitar" surfaced the gap; closing it now avoids adding the two new verbs without these forms and
then having to retrofit them later.

## What Changes

- Add `imperativo_afirmativo` and `imperativo_negativo` as new quizzable tenses (`TenseId`), each
  covering the five persons that take a command form (`tú`, `él/ella` as usted, `nosotros`,
  `vosotros`, `ellos/ellas` as ustedes) — Spanish has no first-person-singular imperative.
- Introduce an `excludedPersons` field on tense metadata (`TENSES` in `src/data/tenses.ts`) so the
  conjugation-quiz question pool generator (`src/lib/questionGenerator.ts`) can skip persons a tense
  doesn't have, instead of every tense being assumed to cover all six persons.
- Add a `gerund: string` reference field to the `Verb` interface (parallel to the existing
  `participle: string`), shown the same way participle is today — informational only, not quizzed.
- Backfill `imperativo_afirmativo`, `imperativo_negativo` conjugations/translations/examples and
  `gerund` for all 137 existing verbs in `src/data/verbs.ts`, plus the two new verbs (`andar`,
  `quitar`) from the earlier discussion.
- **BREAKING**: `Verb.conjugations` and `VerbTranslation.conjugations` gain two new required
  `TenseId` keys — every existing verb entry must supply them or the data module fails to typecheck.

## Capabilities

### New Capabilities
- `verb-conjugation`: the tense/person model for the verb database — which tenses exist, which
  persons each tense covers, and the reference-only (non-quizzed) verb metadata fields like
  participle and gerund.

### Modified Capabilities
(none — no existing spec currently documents verb/tense/quiz behavior)

## Impact

- **Types**: `src/types/grammar.ts` (`TenseId`), `src/types/verb.ts` (`Verb.gerund`).
- **Data**: `src/data/tenses.ts` (new tense metadata + `excludedPersons`), `src/data/verbTemplates.ts`
  (regular imperativo generation), `src/data/verbs.ts` (all 137+ verb entries).
- **Quiz logic**: `src/lib/questionGenerator.ts` (conjugation-pool generation must honor
  `excludedPersons`; phrase-quiz pool needs example sentences for the new tenses).
- **UI**: `src/components/quiz/QuizScreen.tsx`, `src/components/common/ExplanationModal.tsx` (gerund
  display), `src/components/verbs/VerbsListScreen.tsx` (any tense filter list).
- **Validation**: `scripts/validate-verbs.ts` likely needs to check the new fields are present for
  every verb.
