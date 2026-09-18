## MODIFIED Requirements

### Requirement: Vocabulary category list
The system SHALL show a list of vocabulary categories when "Vocabulary" is selected. The first
version SHALL include two categories, "Verbs" and "Nouns". The list SHALL be defined as data so
that adding a category requires adding an entry to that data plus its own screen, without changing
the "Vocabulary" navigation mechanism itself.

#### Scenario: Category list shows Verbs
- **WHEN** a user opens the vocabulary category list
- **THEN** "Verbs" is shown as a selectable category

#### Scenario: Category list shows Nouns
- **WHEN** a user opens the vocabulary category list
- **THEN** "Nouns" is shown as a selectable category

#### Scenario: Selecting Verbs opens the existing verb list
- **WHEN** a user selects "Verbs" from the vocabulary category list
- **THEN** the existing verb list is shown, with its existing search and explanation behavior
  unchanged

#### Scenario: Selecting Nouns opens the noun list
- **WHEN** a user selects "Nouns" from the vocabulary category list
- **THEN** the noun list is shown, with its own search and detail behavior
