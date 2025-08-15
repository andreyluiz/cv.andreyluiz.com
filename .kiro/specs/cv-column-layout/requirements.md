# Requirements Document

## Introduction

This feature adds a layout toggle functionality to the CV tailor application, allowing users to switch between a single-column layout (current implementation) and a two-column layout. The two-column layout will organize content into a left sidebar containing personal information and a right main area containing professional content, with proper alignment using CSS Grid.

## Requirements

### Requirement 1

**User Story:** As a user, I want to toggle between one-column and two-column CV layouts, so that I can choose the most appropriate format for different job applications and printing preferences.

#### Acceptance Criteria

1. WHEN the user accesses the CV page THEN the system SHALL display a layout toggle control in the Controls component
2. WHEN the user clicks the layout toggle THEN the system SHALL switch between single-column and two-column layouts
3. WHEN the layout is changed THEN the system SHALL persist the user's layout preference in local storage
4. WHEN the user reloads the page THEN the system SHALL restore the previously selected layout preference

### Requirement 2

**User Story:** As a user, I want the two-column layout to organize content logically, so that personal information is easily accessible while professional content remains prominent.

#### Acceptance Criteria

1. WHEN the two-column layout is active THEN the left column SHALL contain the profile photo, contact information, and languages
2. WHEN the two-column layout is active THEN the right column SHALL contain the title, summary, qualities, main skills, professional experience, technical skills, and education & certifications
3. WHEN the two-column layout is active THEN projects and publications SHALL be displayed in the right column after education
4. WHEN content is displayed in two columns THEN the system SHALL ensure proper vertical alignment between left and right sections

### Requirement 3

**User Story:** As a user, I want the two-column layout to maintain visual consistency and readability, so that the CV remains professional and easy to scan.

#### Acceptance Criteria

1. WHEN the two-column layout is active THEN the system SHALL use CSS Grid to ensure proper alignment and spacing
2. WHEN sections are displayed THEN titles in the left and right columns SHALL be perfectly aligned horizontally
3. WHEN the layout changes THEN the system SHALL maintain consistent typography, spacing, and visual hierarchy
4. WHEN the CV is printed THEN both layout options SHALL render correctly and maintain their formatting

### Requirement 4

**User Story:** As a user, I want the layout toggle to be intuitive and accessible, so that I can easily switch between layouts without confusion.

#### Acceptance Criteria

1. WHEN the layout toggle is displayed THEN it SHALL use clear visual indicators (icons or labels) to represent each layout option
2. WHEN the user hovers over the toggle THEN the system SHALL provide visual feedback indicating the action
3. WHEN the toggle is activated THEN the system SHALL provide immediate visual feedback showing the layout change
4. WHEN using keyboard navigation THEN the toggle SHALL be accessible via keyboard controls

### Requirement 5

**User Story:** As a user, I want the layout change to be responsive and work across different screen sizes, so that I can preview how the CV will look on various devices.

#### Acceptance Criteria

1. WHEN the two-column layout is active on desktop THEN the system SHALL display content in two distinct columns
2. WHEN the two-column layout is viewed on mobile devices THEN the system SHALL gracefully adapt to a single-column layout for readability
3. WHEN the screen size changes THEN the layout SHALL respond appropriately while maintaining the user's layout preference
4. WHEN printing the CV THEN the selected layout SHALL be preserved in the printed output