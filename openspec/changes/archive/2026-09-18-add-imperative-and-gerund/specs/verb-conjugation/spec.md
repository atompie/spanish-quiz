## Purpose

Defines which tenses and grammatical persons the verb database and quiz cover, and which per-verb
metadata is reference-only (shown for information) versus part of the quizzable conjugation grid.

## ADDED Requirements

### Requirement: Imperative mood tenses
The system SHALL support two additional quizzable tenses, affirmative imperative
(`imperativo_afirmativo`) and negative imperative (`imperativo_negativo`), each with its own
per-person conjugation forms, translations, and example sentences, independent from each other
(the negative form is not derived from the affirmative one).

#### Scenario: Affirmative and negative imperative are distinct
- **WHEN** a verb's imperative forms are read for the "tú" person
- **THEN** `imperativo_afirmativo` and `imperativo_negativo` return different Spanish forms (e.g.
  "anda" vs. "no andes")

### Requirement: Tenses declare which persons they cover
The system SHALL let each tense declare the subset of the six grammatical persons (yo, tú, él/ella,
nosotros, vosotros, ellos/ellas) for which it has valid forms, and any code that generates
conjugation questions or displays a conjugation grid SHALL only do so for the persons a tense
declares.

#### Scenario: Imperative tenses exclude first-person singular
- **WHEN** the quiz generates conjugation questions for `imperativo_afirmativo` or
  `imperativo_negativo`
- **THEN** no question is generated for the "yo" person, because Spanish has no first-person-singular
  imperative

#### Scenario: Existing tenses keep covering all six persons
- **WHEN** the quiz generates conjugation questions for `presente`, `preterite`, `futuro`,
  `ir_a_infinitivo`, or `acabar_de_infinitivo`
- **THEN** questions are generated for all six persons, unchanged from current behavior

### Requirement: Gerund is a reference-only verb attribute
The system SHALL store one Spanish gerund form per verb (e.g. "hablando" for "hablar"), displayed to
the learner as reference information alongside the infinitive and participle. The system SHALL NOT
generate quiz questions that ask the learner to produce the gerund.

#### Scenario: Gerund shown in verb explanation
- **WHEN** a learner views a verb's explanation/detail information
- **THEN** the gerund form is shown next to the participle

#### Scenario: Gerund excluded from quiz question pools
- **WHEN** the quiz builds its pool of conjugation or phrase questions
- **THEN** no question targets the gerund field

### Requirement: Every verb has complete imperative and gerund data
The system SHALL provide, for every verb in the database, conjugation forms and translations (in
every supported UI language) for both imperative tenses across all applicable persons, at least one
example sentence per applicable imperative person/tense combination used in phrase quizzes, and a
gerund value.

#### Scenario: No verb is missing imperative or gerund data
- **WHEN** the verb database is validated
- **THEN** every verb entry has non-empty `imperativo_afirmativo` and `imperativo_negativo`
  conjugations for every applicable person, in every supported language, and a non-empty gerund
  value
