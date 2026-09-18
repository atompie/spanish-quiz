## Context

The verb model (`src/types/verb.ts`, `src/types/grammar.ts`) currently assumes every tense has all
six persons: `Conjugations = Record<Person, string>`, and both quiz pool generators
(`collectConjugationPool` in `src/lib/questionGenerator.ts:106-114`) iterate `PERSONS` (all six)
against every entry in `TENSES` without any per-tense filtering. Spanish imperative mood has no
first-person-singular ("yo") form, so this design has to reconcile that gap without turning "yo" into
a form that silently returns an empty string. See `proposal.md` for motivation and
`specs/verb-conjugation/spec.md` for the resulting behavior contract.

## Goals / Non-Goals

**Goals:**
- Represent imperative forms (affirmative and negative) without inventing a fake "yo" value.
- Keep the fix general (data-driven), not a one-off `if (tense === 'imperativo...')` special case
  buried in the quiz generator.
- Keep `participle`/`gerund` as simple reference fields, not tense-like structures — they don't vary
  by person, so they don't need the `Conjugations` shape at all.

**Non-Goals:**
- Subjunctive mood beyond what negative imperative needs (negative imperative forms are hand-authored
  per verb, not derived from a general present-subjunctive conjugator).
- Vos/vosotros regional variation beyond the forms already modeled (the app already has a `vosotros`
  person; no new persons are introduced).
- Retrofitting `Conjugations` to be `Partial` everywhere — see Decision 1 for why that's avoided.

## Decisions

### Decision 1: `excludedPersons` on tense metadata, not `Partial<Conjugations>`

Add `excludedPersons?: Person[]` to `TenseMeta` (`src/data/tenses.ts`), set to `['yo']` for both
imperative tenses. `collectConjugationPool` filters `PERSONS` through
`!tense.excludedPersons?.includes(person)` before pushing pool entries, so no question is ever
generated for "yo" + imperative.

`Conjugations` itself (`Record<Person, string>`) stays exactly as-is — imperative verb entries still
supply a `yo` key, but it holds a fixed sentinel-free non-answer (see Decision 2), and no code path
that reads it for "yo" imperative can be reached from the quiz.

Alternative considered: change `Conjugations` to `Partial<Record<Person, string>>` everywhere. Rejected
— it would force every one of the ~15 existing read sites of `verb.conjugations[tense][person]`
(quiz generator, `ExplanationModal`, any grid rendering) to add undefined-checks for tenses that
today are guaranteed complete, spreading a narrow imperative-only concern across unrelated code.

### Decision 2: What goes in the "yo" slot for imperative tenses

Since `Conjugations` keeps requiring a `yo` key (Decision 1), imperative verb entries set
`yo: '—'` (an em dash) rather than `''`. Rationale: an empty string is easy to mistake for "not yet
filled in" during data entry / review; a visible placeholder makes it unambiguous that the absence is
intentional. This value is never read by quiz or UI code because `excludedPersons` keeps "yo" out of
the imperative conjugation-question pool and the phrase-quiz pool never includes person "yo" examples
for these tenses by construction (no example is authored for it).

### Decision 3: Negative imperative is authored per-verb, not derived

`imperativo_negativo` forms (e.g. "no hables", "no andes") happen to equal the present subjunctive
plus "no" for regular verbs, but the codebase has no subjunctive conjugator and building one just to
derive five forms per verb is out of scope (see Non-Goals). `verbTemplates.ts` gains a
`conjugateImperativeAfirmativo`/`conjugateImperativeNegativo` pair that mechanically derives the
*regular* forms directly from the infinitive (documented stem + ending rules, same pattern as
`conjugateRegular`), and irregular verbs get both moods hand-written in `verbs.ts`, exactly like every
other irregular tense today.

### Decision 4: Gerund is a plain field, not a tense

`gerund: string` is added next to `participle: string` on `Verb` (`src/types/verb.ts`). It does not
get a `VerbTranslation`-level entry either — like participle, it's shown once, in Spanish, in
`ExplanationModal.tsx`, with no per-language translation and no quiz involvement. This matches
existing precedent exactly (participle has no translation and is not quizzed) rather than introducing
a new pattern.

## Risks / Trade-offs

- [137 existing verbs need new data by hand] → Time-boxed, mechanical backfill using
  `conjugateRegular`-style helpers for the ~76 fully-regular verbs; the ~61 irregular verbs need
  manual imperative forms researched per verb. Tracked as explicit tasks, verb-by-verb, so partial
  progress is safe to commit.
- [`scripts/validate-verbs.ts` doesn't yet know about the new required fields] → Extend it as part of
  this change so a missing `gerund` or incomplete imperative data fails validation instead of shipping
  silently incomplete.
- [Negative imperative for irregular verbs is easy to get wrong by hand] → No automated derivation
  exists (Decision 3); mitigate by spot-checking a sample against a reference conjugator during
  review, not by building tooling now.

## Open Questions

(none — the "yo" exclusion mechanism, negative-imperative authoring, and gerund placement are all
resolved above)
