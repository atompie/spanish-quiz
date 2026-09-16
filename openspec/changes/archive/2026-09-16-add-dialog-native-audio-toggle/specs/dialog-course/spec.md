## ADDED Requirements

### Requirement: Native-language audio toggle
The system SHALL provide a small labeled button in the Dialogi practice screen's top bar that lets the learner enable or disable native-language audio playback for learner turns. The button SHALL show an icon alongside a text label. The button SHALL show a plain speaker icon when native-language audio playback is disabled, and a muted/crossed-out speaker icon when it is enabled. The button SHALL also use a marked color, adapted to the current theme (black in a light theme, white in a dark theme), specifically when native-language audio playback is enabled; when disabled, the button SHALL use the default, unmarked styling. The setting SHALL default to disabled and SHALL persist across sessions until the learner changes it.

#### Scenario: Toggle default state
- **WHEN** the learner opens a dialog for the first time (no stored preference)
- **THEN** native-language audio playback is disabled by default

#### Scenario: Toggle changes playback immediately
- **WHEN** the learner activates the top-bar control to enable native-language audio playback
- **THEN** subsequent learner turns play their native-language recording

#### Scenario: Toggle state persists
- **WHEN** the learner enables native-language audio playback and later returns to the Dialogi course, including after restarting the app
- **THEN** native-language audio playback remains enabled

#### Scenario: Enabled state is the marked one
- **WHEN** native-language audio playback is disabled
- **THEN** the top-bar control shows the plain speaker icon and renders with the default, unmarked styling
- **WHEN** native-language audio playback is enabled
- **THEN** the top-bar control shows the muted/crossed-out speaker icon and renders with the theme-adapted marked color (black in light theme, white in dark theme)

#### Scenario: Toggle does not affect Spanish playback
- **WHEN** native-language audio playback is disabled
- **THEN** the Spanish recording for native-speaker turns and for the answer step of learner turns still plays

## MODIFIED Requirements

### Requirement: Learner turn playback
For a text index assigned to the learner in the current mode, the system SHALL: play the native-language recording for that index when native-language audio playback is enabled and the recording exists; or, when native-language audio playback is disabled but the recording exists, display only that index's native-language text (without loading or playing its recording) for a single combined wait that also serves as the translation countdown, with no separate, additional countdown step; or, when the recording is missing regardless of the audio-playback setting, follow the existing missing-recording fallback (its own text-display wait, followed by a separate translation countdown). In every case, the system SHALL then play the Spanish recording for that index as the correct answer, then run a post-answer pause sized from the translation duration used for that turn, then advance to the next turn.

#### Scenario: Learner turn full sequence
- **WHEN** the current turn's text index belongs to the learner
- **THEN** the system plays the native-language recording for that index, then counts down for translation, then plays the Spanish recording for that index, then runs a post-answer pause, then advances to the next turn

#### Scenario: Learner turn full sequence with native-language audio disabled
- **WHEN** the current turn's text index belongs to the learner, native-language audio playback is disabled, and the native-language recording exists
- **THEN** the system displays that index's native-language text for a single combined wait (serving as both the text display and the translation countdown, with no separate second countdown), then plays the Spanish recording for that index, then runs a post-answer pause, then advances to the next turn

### Requirement: Length-based translation countdown
The learner's translation countdown duration SHALL be computed from the duration of whichever native-language step just completed for that turn: the actual duration of the native-language recording, using `wait = clamp(recordingDurationSeconds * 1.5 + 1, 2, 15)` seconds, when native-language audio playback is enabled and the recording exists; or the fallback wait duration computed from that text's word count, using `wait = clamp(0.6 * wordCount + 1, 2, 15)` seconds, when native-language audio playback is disabled (recording exists) or the recording is missing — rather than a single fixed duration shared across all sentences. When native-language audio playback is disabled but the recording exists, this fallback wait duration IS the turn's only native-language-step wait (see "Learner turn playback") — it is not run a second time as an additional countdown.

#### Scenario: Countdown scales with recording length
- **WHEN** the learner's native-language recording for a turn finishes playing
- **THEN** the system starts a countdown of `clamp(recordingDurationSeconds * 1.5 + 1, 2, 15)` seconds before playing the Spanish recording

#### Scenario: Single wait when native-language audio is disabled
- **WHEN** native-language audio playback is disabled for a learner turn and the native-language recording exists
- **THEN** the system runs exactly one wait, of `clamp(0.6 * wordCount + 1, 2, 15)` seconds computed from that text's word count, before playing the Spanish recording — not a text-display wait followed by a separate countdown of the same length
