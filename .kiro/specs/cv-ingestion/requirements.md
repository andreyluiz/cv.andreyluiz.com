# Requirements Document

## Introduction

The CV Ingestion feature allows users to import, manage, and switch between multiple CVs. Users can import raw CV text (typically copied from PDFs or documents) and automatically format it into the application's structured JSON format using AI. The feature provides a management interface to store multiple CVs, switch between them, and maintain the default CV alongside user-ingested ones.

## Requirements

### Requirement 1

**User Story:** As a user, I want to access a CV management modal that shows all my available CVs, so that I can view, select, and manage multiple CV versions.

#### Acceptance Criteria

1. WHEN the user clicks the "My CVs" button THEN the system SHALL display a modal with a list of available CVs
2. WHEN the modal opens THEN the system SHALL display the default CV as the first item in the list
3. WHEN the modal opens THEN the system SHALL display all previously ingested CVs in the list
4. WHEN the modal displays CV items THEN each item SHALL show the CV title and provide action icon buttons with tooltips
5. WHEN the user clicks a "Load CV" icon button on any list item THEN the system SHALL close the modal and display that CV in the main page

### Requirement 2

**User Story:** As a user, I want to create a new CV by ingesting raw text, so that I can add additional CV versions to my collection.

#### Acceptance Criteria

1. WHEN the user clicks the "Ingest New CV" button in the CV management modal THEN the system SHALL transition to a form view
2. WHEN the form is displayed THEN the system SHALL show input fields for CV title and raw CV text
3. WHEN the user enters a title and raw CV text THEN the system SHALL accept unformatted text including titles and section separators
4. WHEN the user submits the form THEN the system SHALL call the OpenAI API with the raw text
5. WHEN calling the AI THEN the system SHALL instruct it to format the text according to the existing CV JSON structure
6. WHEN the AI processes the text THEN the system SHALL return a properly formatted CV JSON object
7. WHEN the formatting is complete THEN the system SHALL save the new CV with the provided title
8. WHEN the new CV is saved THEN the system SHALL return to the CV list view and display the new CV in the list

### Requirement 3

**User Story:** As a user, I want to persist my ingested CVs across browser sessions, so that I don't lose my work when I close and reopen the application.

#### Acceptance Criteria

1. WHEN a new CV is successfully ingested THEN the system SHALL store the CV data persistently in browser storage
2. WHEN a new CV is stored THEN the system SHALL save both the formatted JSON and the original raw text
3. WHEN the application is reopened THEN the system SHALL load all previously ingested CVs from storage
4. WHEN the CV list is displayed THEN the system SHALL show all persisted CVs along with the default CV
5. WHEN a CV is loaded THEN the system SHALL retrieve the formatted JSON data and display it in the main application

### Requirement 4

**User Story:** As a user, I want to edit and re-process my previously ingested CVs, so that I can make corrections and improvements to my CV data.

#### Acceptance Criteria

1. WHEN the user clicks an "Edit" icon button on an ingested CV THEN the system SHALL display the ingestion form with the CV's title and raw text pre-filled
2. WHEN the user makes changes to the title or raw text THEN the system SHALL accept the modifications
3. WHEN the user submits the edited form THEN the system SHALL call the AI to re-process the updated text
4. WHEN re-processing completes THEN the system SHALL update the stored CV with the new formatted data
5. WHEN the update is complete THEN the system SHALL return to the CV list view showing the updated CV

### Requirement 5

**User Story:** As a user, I want clear visual feedback during the AI processing, so that I understand the system is working on my request.

#### Acceptance Criteria

1. WHEN the AI processing begins THEN the system SHALL display a loading indicator
2. WHEN processing is in progress THEN the system SHALL disable the submit button to prevent duplicate requests
3. WHEN processing completes successfully THEN the system SHALL remove the loading indicator and return to the CV list
4. WHEN processing fails THEN the system SHALL remove the loading indicator and display an error message
5. IF the AI call fails THEN the system SHALL display an appropriate error message to the user

### Requirement 6

**User Story:** As a user, I want to delete ingested CVs that I no longer need, so that I can keep my CV list organized and relevant.

#### Acceptance Criteria

1. WHEN the user clicks a "Delete" icon button on an ingested CV THEN the system SHALL prompt for confirmation
2. WHEN the user confirms deletion THEN the system SHALL remove the CV from persistent storage
3. WHEN the CV is deleted THEN the system SHALL update the CV list to no longer show the deleted CV
4. WHEN the default CV is displayed THEN the system SHALL NOT show a delete icon button (default CV cannot be deleted)
5. WHEN action icon buttons are displayed THEN each SHALL have a descriptive tooltip (title attribute)
6. WHEN hovering over action icons THEN the system SHALL display appropriate tooltips like "Load CV", "Edit CV", "Delete CV"

### Requirement 7

**User Story:** As a user, I want the CV ingestion feature to work consistently across all supported languages, so that I can use it regardless of my locale preference.

#### Acceptance Criteria

1. WHEN the feature is used THEN all UI text SHALL be internationalized using the existing translation system
2. WHEN processing CV text THEN the system SHALL work with CVs in English, French, and Portuguese
3. WHEN displaying the modal THEN all labels and buttons SHALL appear in the user's selected language
4. WHEN errors occur THEN error messages SHALL be displayed in the user's selected language