## ADDED Requirements

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
