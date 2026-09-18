# listening-lessons Specification

## Purpose

Defines how Listening/Speaking lessons are identified, ordered, and labeled for display, so lesson data can be organized by CEFR level instead of arbitrary creation order while still presenting a friendly name to the user.

## Requirements

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

### Requirement: Answer-wait time control lives in the listening course top bar
The system SHALL present the answer-wait-time control (3, 5, or 10 seconds) as a set of selectable icons on the left side of the listening course's own top bar, and SHALL NOT present it on the separate Settings screen.

#### Scenario: Control shown before starting a lesson
- **WHEN** a learner has picked a listening lesson but has not yet started it
- **THEN** the 3 | 5 | 10 wait-time icons are visible on the left side of the top bar, alongside the existing close/stop control on the right

#### Scenario: Control shown during an active lesson
- **WHEN** a listening session is actively running (playing, waiting for an answer, or paused)
- **THEN** the 3 | 5 | 10 wait-time icons remain visible on the left side of the top bar

#### Scenario: Settings screen no longer offers the control
- **WHEN** a learner opens the Settings screen
- **THEN** no answer-wait-time control for the listening course is shown there

### Requirement: Wait-time selection is global and applies immediately
Selecting a wait-time value in the listening course top bar SHALL update the single shared wait-time setting used by all listening lessons, and SHALL take effect for the lesson currently in progress without requiring the learner to restart it.

#### Scenario: Changing the value mid-lesson updates the current countdown behavior
- **WHEN** a learner selects a different wait-time value (e.g. from 5 to 10) while a listening session is running
- **THEN** subsequent answer-wait countdowns in that same session use the newly selected duration

#### Scenario: Changed value persists for future lessons
- **WHEN** a learner selects a wait-time value and later starts a different listening lesson
- **THEN** the newly selected wait-time value is used for that lesson too

### Requirement: Pause/resume control lives in the listening course top bar
While a listening session is actively running (playing, waiting for an answer, or paused), the system SHALL present the pause/resume control as an icon in the listening course's top bar, positioned to the left of the close/stop icon, and SHALL NOT present it as a separate control elsewhere on the screen.

#### Scenario: Pause icon shown during an active session
- **WHEN** a listening session is playing or waiting for an answer
- **THEN** a pause icon is visible in the top bar, to the left of the close/stop icon

#### Scenario: Resume icon shown while paused
- **WHEN** a listening session is paused
- **THEN** the top bar shows a resume (play) icon in the same position, in place of the pause icon, styled as selected/active to indicate the paused state

#### Scenario: Control not shown before a session starts
- **WHEN** a learner has picked a listening lesson but has not yet started it
- **THEN** no pause/resume icon is shown in the top bar

### Requirement: Screen stays awake during an active listening session
While a listening session is playing audio or waiting for an answer (i.e. not paused, stopped, or finished), the system SHALL request that the device's screen not automatically lock due to inactivity. The system SHALL release this request as soon as the session is paused, stopped, or finished, or when the platform does not support making such a request.

#### Scenario: Screen lock is deferred while a session runs
- **WHEN** a listening session starts and reaches the playing or answering phase
- **THEN** the system requests that the screen stay awake for as long as the session remains active

#### Scenario: Screen can lock again after the session ends
- **WHEN** the learner pauses, stops, or finishes the listening session
- **THEN** the system releases its request to keep the screen awake

### Requirement: Backgrounding is treated as an implicit pause with resume
If a listening session is backgrounded, or the app is suspended and later reloaded, while a session was in progress, the system SHALL treat this the same as the learner pausing: on return, the learner SHALL be offered to resume the same lesson from the same round and phase it was in, rather than losing session progress. If session state could not be preserved (e.g. the platform discarded it entirely), the system SHALL fall back to its normal idle/start state instead of presenting a broken or partially-loaded session.

#### Scenario: Returning after the app was backgrounded mid-session
- **WHEN** the learner backgrounds the app while a listening session is in progress and returns to it later
- **THEN** the system offers to resume the same lesson at the same round and phase it was in when it was last active

#### Scenario: Session state could not be preserved
- **WHEN** the learner returns to the app after it was fully reloaded and no preserved session state is found
- **THEN** the system presents its normal idle/start state rather than an incomplete or broken session
