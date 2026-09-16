## MODIFIED Requirements

### Requirement: Lesson id encodes CEFR level
Each listening lesson SHALL be identified by an id of the form `lesson_<LEVEL>`, where `<LEVEL>` is a CEFR level letter (`A`, `B`, or `C`) followed by a sublevel digit (`1` or `2`), an optional `.<N>` sequence number, and an optional further `.<M>` sub-sequence number (e.g. `A1.1`, `B1.10`, `A1.1.1`). The sub-sequence number is optional: most lessons SHALL NOT have one, and a lesson id without it behaves exactly as before this segment was introduced.

#### Scenario: Level-based lesson id
- **WHEN** a lesson directory is named `lesson_B1.1`
- **THEN** the system treats `B1.1` as that lesson's level identifier

#### Scenario: Sub-lesson id
- **WHEN** a lesson directory is named `lesson_A1.1.1`
- **THEN** the system treats `A1.1.1` as that lesson's level identifier, with sequence `1` and sub-sequence `1`

### Requirement: Friendly lesson label
The system SHALL derive a human-readable lesson label from a level-based lesson id by combining the localized "Lesson" word with the level identifier, including any sub-sequence number when present, and SHALL NOT display the raw `lesson_<LEVEL>` id to the user.

#### Scenario: Level-based id is labeled correctly
- **WHEN** the lesson list renders a lesson with id `lesson_B1.1`
- **THEN** the displayed label is `"Lesson B1.1"` (or the localized equivalent of "Lesson"), not `"lesson_B1.1"`

#### Scenario: Sub-lesson id is labeled correctly
- **WHEN** the lesson list renders a lesson with id `lesson_A1.1.1`
- **THEN** the displayed label is `"Lesson A1.1.1"` (or the localized equivalent of "Lesson"), not the raw id

#### Scenario: Unrecognized id falls back to raw name
- **WHEN** a lesson id does not match the `lesson_<LEVEL>` pattern
- **THEN** the system displays the raw lesson id as a fallback label

### Requirement: Natural ordering by level and sequence
The system SHALL order lessons first by CEFR level (A1, A2, B1, B2, C1, C2, in that progression), then numerically by their `.<N>` sequence number, then numerically by their `.<M>` sub-sequence number when present, so that multi-digit sequence numbers (e.g. `.10`) sort after single-digit ones (e.g. `.2`) within the same level, and a sub-lesson (e.g. `.1.1`) sorts immediately after its parent lesson (e.g. `.1`) and before the next sequence number (e.g. `.2`).

#### Scenario: Multi-digit sequence numbers sort correctly
- **WHEN** the lesson list contains `lesson_A1.2` and `lesson_A1.10`
- **THEN** `lesson_A1.2` is listed before `lesson_A1.10`

#### Scenario: Levels sort in CEFR progression
- **WHEN** the lesson list contains lessons at levels A1 and B1
- **THEN** all A1 lessons are listed before all B1 lessons

#### Scenario: Sub-lessons sort between their parent and the next sequence number
- **WHEN** the lesson list contains `lesson_A1.1`, `lesson_A1.1.1`, `lesson_A1.1.2`, and `lesson_A1.2`
- **THEN** they are listed in the order `lesson_A1.1`, `lesson_A1.1.1`, `lesson_A1.1.2`, `lesson_A1.2`
