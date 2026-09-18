## Purpose

Defines the "Nouns" vocabulary category: how the noun list is sourced at runtime, and how a learner
browses nouns and views each noun's article, plural form, and meaning.

## Requirements

### Requirement: Noun data shape
Each noun SHALL have a stable id, its Spanish form (singular, gender article `el`/`la`, and plural),
and a meaning per supported UI language. The plural article SHALL be derived from the singular
article by default (`el` → `los`, `la` → `las`), except for feminine nouns that take `el` in the
singular for euphonic reasons (e.g. "el agua"), whose plural article is always `las` and MUST be
stored explicitly since it cannot be derived from the singular article.

#### Scenario: Plural article derived from singular article
- **WHEN** a noun's article is `la`, or `el` without a stored plural-article override
- **THEN** its plural form is displayed with the article `las` (for `la`) or `los` (for `el`),
  without that value being present in the noun's stored data

#### Scenario: Plural article overridden for a euphonic-exception noun
- **WHEN** a noun's singular article is `el` for phonetic reasons even though the noun is feminine
  (e.g. "el agua", plural "las aguas")
- **THEN** the noun's stored data explicitly provides `las` as its plural article, and the detail
  view shows that stored value instead of the derived `los`

### Requirement: Noun list is runtime data
The noun list SHALL be loaded at runtime from `public/vocabulary/nouns/metadata.json`, a single JSON
object keyed by noun id, the same way existing lesson/dialog metadata is loaded from `public/`
rather than bundled as application source code. Adding, removing, or editing a noun SHALL only
require editing that file, not rebuilding the application.

#### Scenario: Noun added to metadata.json appears without a code change
- **WHEN** a new entry is added to `public/vocabulary/nouns/metadata.json`
- **THEN** the noun appears in the nouns list the next time it is loaded, with no source code change

#### Scenario: Metadata fails to load
- **WHEN** `public/vocabulary/nouns/metadata.json` cannot be fetched (e.g. network error)
- **THEN** the nouns screen shows an error state instead of an empty or partial list

#### Scenario: Metadata is empty
- **WHEN** `public/vocabulary/nouns/metadata.json` contains no nouns
- **THEN** the nouns screen shows an empty state, distinct from the error state

### Requirement: Nouns category in vocabulary browsing
Selecting "Nouns" from the vocabulary category list SHALL show a searchable list of nouns. Selecting
a noun from that list SHALL open a detail view showing its article, singular form, plural form, and
meaning in the learner's current UI language.

#### Scenario: Search filters the noun list
- **WHEN** a learner types into the noun search field
- **THEN** only nouns whose singular form starts with the typed text (case-insensitive) remain in
  the list

#### Scenario: Selecting a noun shows its detail
- **WHEN** a learner selects a noun from the list
- **THEN** a detail view opens showing the noun with its article (e.g. "la cosa"), its plural form
  with the derived plural article (e.g. "las cosas"), and its meaning in the learner's UI language

#### Scenario: Closing the detail view returns to the noun list
- **WHEN** a learner closes the noun detail view
- **THEN** the noun list is shown again, unchanged
