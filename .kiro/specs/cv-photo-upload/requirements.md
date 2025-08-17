# Requirements Document

## Introduction

This feature extends the existing CV ingestion functionality by adding the ability for users to upload and manage custom profile photos for their ingested CVs. Users will be able to upload a photo during the CV ingestion process, with the photo being stored locally in the browser and associated with the specific CV. The uploaded photo will replace the default profile image and be displayed in the same round format as the current default photo.

## Requirements

### Requirement 1

**User Story:** As a user ingesting a new CV, I want to upload a custom profile photo, so that my resume displays with my personal image instead of the default placeholder.

#### Acceptance Criteria

1. WHEN the user is on the CV ingestion form THEN the system SHALL display a photo upload section alongside the existing title and text inputs
2. WHEN the user clicks the photo upload area THEN the system SHALL open a file picker dialog for image selection
3. WHEN the user selects an image file THEN the system SHALL validate the file type is an accepted image format (JPEG, PNG, WebP)
4. WHEN the user selects an image file THEN the system SHALL validate the file size is within the allowed limit
5. WHEN a valid image is selected THEN the system SHALL display a preview of the image in a round format matching the current profile image style

### Requirement 2

**User Story:** As a user, I want to have file size limits enforced on photo uploads, so that the application remains performant and doesn't consume excessive browser storage.

#### Acceptance Criteria

1. WHEN the user selects an image file larger than 2MB THEN the system SHALL reject the upload and display an error message
2. WHEN the user selects an image file of 2MB or smaller THEN the system SHALL accept the file for processing
3. WHEN an oversized file is rejected THEN the system SHALL display a clear error message indicating the size limit
4. WHEN the file size validation fails THEN the system SHALL not proceed with the upload process

### Requirement 3

**User Story:** As a user, I want my uploaded photos to be stored locally with my CV data, so that my photos persist across browser sessions and are associated with the correct CV.

#### Acceptance Criteria

1. WHEN a user uploads a photo during CV ingestion THEN the system SHALL store the photo data in browser local storage
2. WHEN a photo is stored THEN the system SHALL associate it with the specific CV using the CV's unique identifier
3. WHEN the user closes and reopens the application THEN the system SHALL retrieve and display the correct photo for each CV
4. WHEN a CV is deleted THEN the system SHALL also remove the associated photo data from storage
5. WHEN the CV ingestion is completed with a photo THEN the system SHALL include the photo reference in the CV data structure

### Requirement 4

**User Story:** As a user editing an existing CV, I want to update or remove the associated photo, so that I can keep my CV information current.

#### Acceptance Criteria

1. WHEN the user edits an existing CV that has a photo THEN the system SHALL display the current photo in the upload area
2. WHEN editing a CV with a photo THEN the user SHALL be able to replace the photo by selecting a new image
3. WHEN editing a CV with a photo THEN the user SHALL be able to remove the photo by clicking a remove button
4. WHEN a photo is removed THEN the system SHALL revert to showing the upload placeholder
5. WHEN changes are saved THEN the system SHALL update the stored photo data accordingly

### Requirement 5

**User Story:** As a user viewing my CV, I want uploaded photos to display in the same visual style as the default photo, so that the interface remains consistent and professional.

#### Acceptance Criteria

1. WHEN a CV with an uploaded photo is displayed THEN the system SHALL show the photo in a round/circular format
2. WHEN displaying the uploaded photo THEN the system SHALL maintain the same size and positioning as the default profile image
3. WHEN no photo is uploaded THEN the system SHALL continue to display the default profile image
4. WHEN switching between CVs THEN the system SHALL display the correct photo for each CV
5. WHEN the photo fails to load THEN the system SHALL fallback to the default profile image

### Requirement 6

**User Story:** As a user, I want clear feedback during the photo upload process, so that I understand the status of my upload and any issues that occur.

#### Acceptance Criteria

1. WHEN a photo upload is in progress THEN the system SHALL display a loading indicator
2. WHEN a photo upload succeeds THEN the system SHALL show the uploaded image preview immediately
3. WHEN a photo upload fails THEN the system SHALL display a specific error message explaining the failure
4. WHEN file validation fails THEN the system SHALL provide clear guidance on acceptable file types and sizes
5. WHEN the upload area is empty THEN the system SHALL display helpful placeholder text indicating photo upload capability

### Requirement 7

**User Story:** As a user, I want the photo upload feature to be accessible, so that all users can effectively use this functionality regardless of their abilities.

#### Acceptance Criteria

1. WHEN using keyboard navigation THEN the user SHALL be able to access and activate the photo upload area using the Tab and Enter keys
2. WHEN using screen readers THEN the system SHALL provide appropriate ARIA labels and descriptions for the upload area
3. WHEN an error occurs THEN the system SHALL announce the error message to screen readers
4. WHEN a photo is successfully uploaded THEN the system SHALL provide confirmation that is accessible to screen readers
5. WHEN the upload area has focus THEN the system SHALL provide clear visual focus indicators