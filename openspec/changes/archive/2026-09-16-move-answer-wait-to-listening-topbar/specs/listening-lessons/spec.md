## ADDED Requirements

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
