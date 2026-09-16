## ADDED Requirements

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
