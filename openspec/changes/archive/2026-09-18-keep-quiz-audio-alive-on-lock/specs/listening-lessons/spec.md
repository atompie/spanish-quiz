## ADDED Requirements

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
