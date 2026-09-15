## Purpose

Lets a learner rehearse live spoken translation by running scripted two-person Spanish dialogs twice — once responding as the second speaker, once initiating as the first — with a length-based pause to translate each learner line before hearing the correct Spanish version.

## ADDED Requirements

### Requirement: Dialog course selection
The system SHALL offer "Dialogi" as a selectable quiz kind in the existing quiz-kind picker, alongside the phrase, conjugation, and listening kinds.

#### Scenario: Learner selects the dialog kind
- **WHEN** the learner opens the "Kursy" tab and selects the "Dialogi" option
- **THEN** the system shows a list of available dialogs to choose from

### Requirement: Dialog list
The system SHALL list every dialog found under the dialog content directory, using its shared metadata file as the source of dialog text and its generated manifest to know which recordings exist.

#### Scenario: Dialog list reflects available content
- **WHEN** the learner opens the dialog list
- **THEN** the system shows one entry per dialog defined in the shared dialog metadata file

### Requirement: Two-pass session structure
Selecting a dialog SHALL run it exactly twice within one session: Mode A ("Rozmówca zaczyna"), where the native speaker takes the even text indices (0, 2, 4, ...) and the learner takes the odd indices, followed automatically by Mode B ("Ty zaczynasz"), where the learner takes the even indices and the native speaker takes the odd indices.

#### Scenario: Mode A runs before Mode B
- **WHEN** a dialog session starts
- **THEN** the system runs Mode A first, assigning even text indices to the native speaker and odd indices to the learner

#### Scenario: Automatic transition between modes
- **WHEN** Mode A finishes all turns in a dialog
- **THEN** the system shows a "Teraz Ty zaczynasz" transition message and then automatically starts Mode B for the same dialog without requiring learner input

#### Scenario: Session ends after both modes
- **WHEN** Mode B finishes all turns in a dialog
- **THEN** the system ends the session and returns the learner directly to the dialog list, without showing an intermediate summary or finished screen

### Requirement: Native-speaker turn playback
For a text index assigned to the native speaker in the current mode, the system SHALL play only the Spanish recording for that index, with no learner-facing pause and no native-language audio or text driving the turn.

#### Scenario: Native-speaker turn plays Spanish only
- **WHEN** the current turn's text index belongs to the native speaker
- **THEN** the system plays that index's Spanish recording and advances to the next turn when playback ends, without pausing for translation

### Requirement: Learner turn playback
For a text index assigned to the learner in the current mode, the system SHALL: play the native-language recording for that index; then run a translation countdown; then play the Spanish recording for that index as the correct answer.

#### Scenario: Learner turn full sequence
- **WHEN** the current turn's text index belongs to the learner
- **THEN** the system plays the native-language recording for that index, then counts down for translation, then plays the Spanish recording for that index, then advances to the next turn

### Requirement: Length-based translation countdown
The learner's translation countdown duration SHALL be computed from the actual duration of the native-language recording just played, using `wait = clamp(recordingDurationSeconds * 1.5 + 1, 2, 15)` seconds, rather than a single fixed duration shared across all sentences.

#### Scenario: Countdown scales with recording length
- **WHEN** the learner's native-language recording for a turn finishes playing
- **THEN** the system starts a countdown of `clamp(recordingDurationSeconds * 1.5 + 1, 2, 15)` seconds before playing the Spanish recording

### Requirement: Missing-recording fallback
When an expected recording for a turn's language is missing, the system SHALL skip playback for that language and instead display only that language's text for a duration computed from its word count, using `wait = clamp(0.6 * wordCount + 1, 2, 15)` seconds, then continue the turn sequence. A missing recording SHALL NOT exclude the dialog, the turn, or the learner's translation countdown.

#### Scenario: Missing native-language recording for a learner turn
- **WHEN** the learner's native-language recording for a turn is missing
- **THEN** the system shows the native-language text for `clamp(0.6 * wordCount + 1, 2, 15)` seconds, then proceeds to the translation countdown as if the recording had played

#### Scenario: Missing Spanish recording
- **WHEN** the Spanish recording for a turn (native-speaker turn, or the answer step of a learner turn) is missing
- **THEN** the system shows the Spanish text for `clamp(0.6 * wordCount + 1, 2, 15)` seconds, then advances to the next turn

### Requirement: Language-synced text display
The system SHALL display the text of the language currently being played or waited on for translation: the native-language text during native-language playback or its fallback, and the Spanish text during Spanish playback, its fallback, or the translation countdown.

#### Scenario: Text matches current audio phase
- **WHEN** a turn is in a native-language phase
- **THEN** the system displays that turn's native-language text
- **WHEN** a turn is in a Spanish-playback phase or the translation countdown
- **THEN** the system displays that turn's Spanish text

### Requirement: Pause and resume
The learner SHALL be able to pause a dialog session at any point — during audio playback, a translation countdown, or a missing-recording fallback wait — and resume it from exactly the point it was paused, with no loss of elapsed progress.

#### Scenario: Pause during a countdown and resume
- **WHEN** the learner pauses during a translation countdown or fallback wait
- **THEN** the remaining time is preserved, and resuming continues the same countdown from the remaining time rather than restarting it

#### Scenario: Pause during audio playback and resume
- **WHEN** the learner pauses during audio playback
- **THEN** playback stops immediately, and resuming continues the same recording from where it stopped
