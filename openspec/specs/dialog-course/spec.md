# dialog-course Specification

## Purpose

Lets a learner rehearse live spoken translation by running scripted two-person Spanish dialogs twice — once responding as the second speaker, once initiating as the first — with a length-based pause to translate each learner line before hearing the correct Spanish version.

## Requirements

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
For a text index assigned to the native speaker in the current mode, the system SHALL play only the Spanish recording for that index (or its missing-recording fallback text display), then run a post-answer pause sized from that Spanish line's own duration, then advance to the next turn.

#### Scenario: Native-speaker turn plays Spanish only
- **WHEN** the current turn's text index belongs to the native speaker
- **THEN** the system plays that index's Spanish recording, then runs a post-answer pause, then advances to the next turn

### Requirement: Learner turn playback
For a text index assigned to the learner in the current mode, the system SHALL: play the native-language recording for that index; then run a translation countdown; then play the Spanish recording for that index as the correct answer; then run a post-answer pause sized from the translation duration used for that turn; then advance to the next turn.

#### Scenario: Learner turn full sequence
- **WHEN** the current turn's text index belongs to the learner
- **THEN** the system plays the native-language recording for that index, then counts down for translation, then plays the Spanish recording for that index, then runs a post-answer pause, then advances to the next turn

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

### Requirement: Language-synced text display
The system SHALL render the dialog as a chat log of turn bubbles rather than a single sentence. For the in-progress turn, the system SHALL display the text of the language currently being played or waited on: the native-language text during native-language playback or its fallback, and the Spanish text during Spanish playback, its fallback, or the translation countdown. Once a turn completes, its bubble SHALL retain only the Spanish text as its permanent content in the log.

#### Scenario: Text matches current audio phase
- **WHEN** the in-progress turn is in a native-language phase
- **THEN** its bubble displays that turn's native-language text
- **WHEN** the in-progress turn is in a Spanish-playback phase or the translation countdown
- **THEN** its bubble displays that turn's Spanish text

#### Scenario: Completed bubble shows Spanish text only
- **WHEN** a turn finishes (its next turn becomes in-progress, or the dialog ends)
- **THEN** the finished turn's bubble content becomes fixed to its Spanish text, regardless of whether it was a learner or native-speaker turn

### Requirement: Turn history chat log
The system SHALL display, for the current mode's pass, every turn from the start of that pass up to and including the in-progress turn, each as its own bubble, so the learner can see the conversation so far without losing earlier turns.

#### Scenario: Earlier turns remain visible
- **WHEN** the dialog advances past a turn to a later one within the same mode
- **THEN** the earlier turn's bubble remains visible in the chat log above the newer turn's bubble

### Requirement: Bubble side by dialog character
The system SHALL position each turn's bubble on a side of the chat log determined by `text index % 2` (the dialog character that line belongs to), independent of the current mode or of which speaker (learner or native) is voicing that index in the current mode.

#### Scenario: Same character stays on the same side across modes
- **WHEN** a given text index is voiced by the native speaker in Mode A and by the learner in Mode B
- **THEN** that text index's bubble renders on the same side of the chat log in both modes

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

### Requirement: Active bubble animation
The system SHALL animate (pulse) only the in-progress turn's bubble. Bubbles for completed turns SHALL be static, with no pulse animation.

#### Scenario: Only the in-progress bubble pulses
- **WHEN** the chat log shows one or more completed bubbles alongside the in-progress bubble
- **THEN** only the in-progress bubble pulses; the completed bubbles do not animate

### Requirement: Chat log reset on mode transition
The system SHALL clear the chat log when the mode-transition banner between Mode A and Mode B is shown, so Mode B starts with an empty log.

#### Scenario: Log is empty at the start of Mode B
- **WHEN** the mode-transition banner finishes and Mode B begins
- **THEN** the chat log contains no bubbles from Mode A

### Requirement: Pause and resume
The learner SHALL be able to pause a dialog session at any point — during audio playback, a translation countdown, a missing-recording fallback wait, or a post-answer pause — and resume it from exactly the point it was paused, with no loss of elapsed progress.

#### Scenario: Pause during a countdown and resume
- **WHEN** the learner pauses during a translation countdown, fallback wait, or post-answer pause
- **THEN** the remaining time is preserved, and resuming continues the same wait from the remaining time rather than restarting it

#### Scenario: Pause during audio playback and resume
- **WHEN** the learner pauses during audio playback
- **THEN** playback stops immediately, and resuming continues the same recording from where it stopped
