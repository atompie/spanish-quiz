## MODIFIED Requirements

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

## ADDED Requirements

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
While a turn belongs to the learner and is still in progress, the system SHALL render its bubble with an active (orange) background and a small tag in the bubble's corner showing the countdown seconds currently in effect for that turn (translation countdown or missing-recording fallback wait). Native-speaker turns SHALL NOT show this active background or countdown tag. Once a turn finishes, its bubble SHALL lose the active background and countdown tag and take on the same neutral style as other bubbles in the log.

#### Scenario: Learner turn shows orange background and countdown tag
- **WHEN** the in-progress turn belongs to the learner and a countdown or fallback wait is running
- **THEN** its bubble has an orange active background and a corner tag showing the remaining seconds

#### Scenario: Native-speaker turn has no active styling
- **WHEN** the in-progress turn belongs to the native speaker
- **THEN** its bubble has no orange active background and no countdown tag

#### Scenario: Highlighting clears once the turn is done
- **WHEN** a learner turn that had the active background and countdown tag finishes and the next turn becomes in-progress
- **THEN** the finished turn's bubble no longer shows the orange background or the countdown tag

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
