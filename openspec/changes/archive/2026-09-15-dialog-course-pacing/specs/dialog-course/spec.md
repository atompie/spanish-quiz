## MODIFIED Requirements

### Requirement: Native-speaker turn playback
For a text index assigned to the native speaker in the current mode, the system SHALL play only the Spanish recording for that index (or its missing-recording fallback text display), then run a post-answer pause sized from that Spanish line's own duration, then advance to the next turn.

#### Scenario: Native-speaker turn plays Spanish only
- **WHEN** the current turn's text index belongs to the native speaker
- **THEN** the system plays that index's Spanish recording, then runs a post-answer pause, then advances to the next turn

### Requirement: Learner turn playback
For a text index assigned to the learner in the current mode, the system SHALL: play the native-language recording for that index; then run a translation countdown; then play the Spanish recording for that index as the correct answer; then run a post-answer pause sized from the translation duration used for that turn; then advance to the next turn.

#### Scenario: Learner turn full sequence
- **WHEN** the current turn's text index belongs to the learner
- **THEN** the system plays the native-language recording for that index, then counts down for translation, then plays the Spanish recording for that index, then runs a post-answer pause, then advances to the next turn

### Requirement: Active learner turn highlighting
While a turn belongs to the learner and is still in progress, the system SHALL render its bubble with an active (orange) background. During the translation countdown or a missing-recording fallback wait, the bubble SHALL show a small tag in its top corner with the countdown seconds currently in effect. During the post-answer pause, the bubble SHALL instead show a small spinning icon in its bottom corner, with no numeric countdown, signaling that the exchange is still ongoing. Native-speaker turns SHALL NOT show the active background or either tag. Once a turn finishes, its bubble SHALL lose the active background and any tag and take on the same neutral style as other bubbles in the log.

#### Scenario: Learner turn shows orange background and countdown tag
- **WHEN** the in-progress turn belongs to the learner and a translation countdown or fallback wait is running
- **THEN** its bubble has an orange active background and a top-corner tag showing the remaining seconds

#### Scenario: Learner turn shows a spinning icon during the post-answer pause
- **WHEN** the in-progress turn belongs to the learner and the post-answer pause is running
- **THEN** its bubble has an orange active background and a bottom-corner spinning icon, with no numeric countdown shown

#### Scenario: Native-speaker turn has no active styling
- **WHEN** the in-progress turn belongs to the native speaker
- **THEN** its bubble has no orange active background and no corner tag, in any phase including the post-answer pause

#### Scenario: Highlighting clears once the turn is done
- **WHEN** a learner turn that had the active background and a tag finishes and the next turn becomes in-progress
- **THEN** the finished turn's bubble no longer shows the orange background or any tag

### Requirement: Pause and resume
The learner SHALL be able to pause a dialog session at any point — during audio playback, a translation countdown, a missing-recording fallback wait, or a post-answer pause — and resume it from exactly the point it was paused, with no loss of elapsed progress.

#### Scenario: Pause during a countdown and resume
- **WHEN** the learner pauses during a translation countdown, fallback wait, or post-answer pause
- **THEN** the remaining time is preserved, and resuming continues the same wait from the remaining time rather than restarting it

#### Scenario: Pause during audio playback and resume
- **WHEN** the learner pauses during audio playback
- **THEN** playback stops immediately, and resuming continues the same recording from where it stopped

## ADDED Requirements

### Requirement: Length-based post-answer pause
After a turn's Spanish playback (or its missing-recording fallback) ends, the system SHALL run a post-answer pause before advancing to the next turn, sized at 85% of the duration that drove the immediately preceding step:
- For a learner turn, 85% of the translation duration used for that turn (the native-language recording's actual duration, or the fallback wait duration when that recording was missing).
- For a native-speaker turn, 85% of the Spanish line's own duration (its recording's actual duration, or the fallback wait duration when that recording was missing).

#### Scenario: Post-answer pause after a learner turn
- **WHEN** a learner turn's Spanish playback (or its fallback) ends
- **THEN** the system pauses for 85% of that turn's translation duration before advancing to the next turn

#### Scenario: Post-answer pause after a native-speaker turn
- **WHEN** a native-speaker turn's Spanish playback (or its fallback) ends
- **THEN** the system pauses for 85% of that Spanish line's own duration before advancing to the next turn
