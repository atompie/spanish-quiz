# listening-lessons Specification

## Purpose

Defines how Listening/Speaking lessons are identified, ordered, and labeled for display, so lesson data can be organized by CEFR level instead of arbitrary creation order while still presenting a friendly name to the user.

## Requirements

### Requirement: Lesson id encodes CEFR level
Each listening lesson SHALL be identified by an id of the form `lesson_<LEVEL>`, where `<LEVEL>` is a CEFR level letter (`A`, `B`, or `C`) followed by a sublevel digit (`1` or `2`) and an optional `.<N>` sequence number (e.g. `A1.1`, `B1.10`).

#### Scenario: Level-based lesson id
- **WHEN** a lesson directory is named `lesson_B1.1`
- **THEN** the system treats `B1.1` as that lesson's level identifier

### Requirement: Friendly lesson label
The system SHALL derive a human-readable lesson label from a level-based lesson id by combining the localized "Lesson" word with the level identifier, and SHALL NOT display the raw `lesson_<LEVEL>` id to the user.

#### Scenario: Level-based id is labeled correctly
- **WHEN** the lesson list renders a lesson with id `lesson_B1.1`
- **THEN** the displayed label is `"Lesson B1.1"` (or the localized equivalent of "Lesson"), not `"lesson_B1.1"`

#### Scenario: Unrecognized id falls back to raw name
- **WHEN** a lesson id does not match the `lesson_<LEVEL>` pattern
- **THEN** the system displays the raw lesson id as a fallback label

### Requirement: Natural ordering by level and sequence
The system SHALL order lessons first by CEFR level (A1, A2, B1, B2, C1, C2, in that progression) and then numerically by their `.<N>` sequence number, so that multi-digit sequence numbers (e.g. `.10`) sort after single-digit ones (e.g. `.2`) within the same level.

#### Scenario: Multi-digit sequence numbers sort correctly
- **WHEN** the lesson list contains `lesson_A1.2` and `lesson_A1.10`
- **THEN** `lesson_A1.2` is listed before `lesson_A1.10`

#### Scenario: Levels sort in CEFR progression
- **WHEN** the lesson list contains lessons at levels A1 and B1
- **THEN** all A1 lessons are listed before all B1 lessons

### Requirement: Optional per-language lesson title
A lesson's metadata MAY declare a `title` mapping languages to a human-readable title for that lesson. The system SHALL treat a lesson without any `title` entry, or without an entry for a specific language, as not having a title in that language.

#### Scenario: Lesson has a title for the learner's native language
- **WHEN** a lesson's metadata declares `title.pl` and the learner's native language is Polish
- **THEN** the system treats that string as the lesson's title

#### Scenario: Lesson has no title at all
- **WHEN** a lesson's metadata declares no `title`
- **THEN** the system treats the lesson as having no title in any language

#### Scenario: Lesson has a title, but not for the learner's native language
- **WHEN** a lesson's metadata declares `title.pl` only and the learner's native language is English
- **THEN** the system treats the lesson as having no title for English, without falling back to the Polish title

### Requirement: Lesson title shown during an active listening session
While a listening session for a lesson is active, the system SHALL display that lesson's title above the countdown/counter, using the title for the learner's native language when available.

#### Scenario: Title shown when available
- **WHEN** the active lesson has a title for the learner's native language
- **THEN** that title is displayed above the countdown/counter for the duration of the session

#### Scenario: Fallback to first part key when no title is available
- **WHEN** the active lesson has no title for the learner's native language
- **THEN** the system displays the first key of that lesson's parts as the title above the countdown/counter

### Requirement: Lesson title used in the lesson picker description
The lesson picker SHALL display a lesson's title for the learner's native language, when available, in place of the topic word normally derived from the lesson's first Spanish sentence.

#### Scenario: Title available for the picker
- **WHEN** a lesson has a title for the learner's native language
- **THEN** the lesson picker shows that title instead of the topic word derived from the first Spanish sentence

#### Scenario: No title available for the picker
- **WHEN** a lesson has no title for the learner's native language
- **THEN** the lesson picker shows the topic word derived from the first Spanish sentence, unchanged from current behavior
