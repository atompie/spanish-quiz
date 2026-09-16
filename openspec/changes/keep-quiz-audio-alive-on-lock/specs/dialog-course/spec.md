## ADDED Requirements

### Requirement: Screen stays awake during an active dialog session
While a dialog session is playing audio, running a translation countdown, a missing-recording fallback wait, or a post-answer pause (i.e. not paused, stopped, or finished), the system SHALL request that the device's screen not automatically lock due to inactivity. The system SHALL release this request as soon as the session is paused, stopped, or finished, or when the platform does not support making such a request.

#### Scenario: Screen lock is deferred while a dialog session runs
- **WHEN** a dialog session starts and is actively playing, counting down, or in a post-answer pause
- **THEN** the system requests that the screen stay awake for as long as the session remains active

#### Scenario: Screen can lock again after the session ends
- **WHEN** the learner pauses, stops, or finishes the dialog session
- **THEN** the system releases its request to keep the screen awake

## MODIFIED Requirements

### Requirement: Pause and resume
The learner SHALL be able to pause a dialog session at any point — during audio playback, a translation countdown, a missing-recording fallback wait, or a post-answer pause — and resume it from exactly the point it was paused, with no loss of elapsed progress. This guarantee SHALL also apply when the pause is implicit: if the app is backgrounded, or suspended and later reloaded, while a dialog session was in progress, the system SHALL treat this the same as an explicit pause and offer to resume the same dialog, mode, and turn on return. If session state could not be preserved (e.g. the platform discarded it entirely), the system SHALL fall back to its normal idle/start state instead of presenting a broken or partially-loaded session.

#### Scenario: Pause during a countdown and resume
- **WHEN** the learner pauses during a translation countdown, fallback wait, or post-answer pause
- **THEN** the remaining time is preserved, and resuming continues the same wait from the remaining time rather than restarting it

#### Scenario: Pause during audio playback and resume
- **WHEN** the learner pauses during audio playback
- **THEN** playback stops immediately, and resuming continues the same recording from where it stopped

#### Scenario: Returning after the app was backgrounded mid-session
- **WHEN** the learner backgrounds the app while a dialog session is in progress and returns to it later
- **THEN** the system offers to resume the same dialog at the same mode and turn it was in when it was last active

#### Scenario: Session state could not be preserved
- **WHEN** the learner returns to the app after it was fully reloaded and no preserved session state is found
- **THEN** the system presents its normal idle/start state rather than an incomplete or broken session
