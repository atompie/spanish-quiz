## Purpose

Defines the "Vocabulary" section of the app's main navigation: a category list that groups word
categories (starting with "Verbs"), so future categories can be added without changing the
top-level navigation mechanism.

## Requirements

### Requirement: Vocabulary menu entry replaces the direct Verbs entry
The main menu SHALL present a "Vocabulary" entry in place of the previous direct "Verbs" entry.
Selecting it SHALL NOT open the verb list directly.

#### Scenario: Verbs entry no longer in main menu
- **WHEN** a user views the main menu
- **THEN** no menu entry opens the verb list directly; a "Vocabulary" entry is present instead

#### Scenario: Selecting Vocabulary opens the category list
- **WHEN** a user selects "Vocabulary" from the main menu
- **THEN** the vocabulary category list is shown, not the verb list

### Requirement: Vocabulary category list
The system SHALL show a list of vocabulary categories when "Vocabulary" is selected. The first
version SHALL include exactly one category, "Verbs". The list SHALL be defined as data so that
adding a category requires adding an entry to that data plus its own screen, without changing the
"Vocabulary" navigation mechanism itself.

#### Scenario: Category list shows Verbs
- **WHEN** a user opens the vocabulary category list
- **THEN** "Verbs" is shown as a selectable category

#### Scenario: Selecting Verbs opens the existing verb list
- **WHEN** a user selects "Verbs" from the vocabulary category list
- **THEN** the existing verb list is shown, with its existing search and explanation behavior
  unchanged

### Requirement: Navigating back to the category list
The system SHALL let a user return from a selected category's screen to the vocabulary category
list, and SHALL reset to the category list when the user re-selects the "Vocabulary" menu entry
while already inside a category.

#### Scenario: Back button returns to category list
- **WHEN** a user is viewing the verb list reached via "Vocabulary" and selects the back action
- **THEN** the vocabulary category list is shown again

#### Scenario: Re-selecting Vocabulary resets to category list
- **WHEN** a user is viewing the verb list reached via "Vocabulary" and selects the "Vocabulary"
  main menu entry again
- **THEN** the vocabulary category list is shown, not the verb list
