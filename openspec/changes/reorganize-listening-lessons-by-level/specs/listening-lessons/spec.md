## Purpose

Defines how Listening/Speaking lessons are identified, ordered, and labeled for display, so lesson data can be organized by CEFR level instead of arbitrary creation order while still presenting a friendly name to the user.

## ADDED Requirements

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
