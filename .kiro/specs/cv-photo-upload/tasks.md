# Implementation Plan

- [x] 1. Set up IndexedDB infrastructure and photo service
  - Create PhotoService class with IndexedDB operations for storing, retrieving, and deleting photos
  - Implement database schema with photos table and cv-id index
  - Add error handling for IndexedDB unavailability and quota exceeded scenarios
  - Write unit tests for PhotoService CRUD operations
  - _Requirements: 3.1, 3.3, 3.4, 5.1, 5.4_

- [x] 2. Extend data types for photo support
  - Add profilePhotoId optional property to IngestedCV interface in types.ts
  - Create PhotoRecord interface for IndexedDB storage structure
  - Add photo-related form data types for CVIngestionForm
  - _Requirements: 3.1, 3.2_

- [x] 3. Create PhotoUpload component with file handling
  - Build PhotoUpload component with drag-and-drop file upload area
  - Implement file type validation (JPEG, PNG, WebP) and size validation (2MB limit)
  - Add image preview functionality with remove option
  - Integrate with PhotoService for storing uploaded photos
  - Include loading states and error handling for upload process
  - _Requirements: 2.1, 2.2, 2.3, 6.1, 6.2, 6.3_

- [x] 4. Add accessibility features to PhotoUpload component
  - Implement keyboard navigation support (Tab, Enter, Space keys)
  - Add ARIA labels and descriptions for screen readers
  - Include focus indicators and error announcements
  - Test with screen reader software for compliance
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 5. Integrate PhotoUpload into CVIngestionForm
  - Add PhotoUpload component between title and rawText fields in CVIngestionForm
  - Extend form state management to include photo data
  - Update form validation to include photo validation errors
  - Modify form submission to handle photo ID in form data
  - _Requirements: 2.1, 4.1, 4.2, 6.4_

- [x] 6. Enhance ProfileImage component for custom photos
  - Add photoId prop to ProfileImage component
  - Implement photo loading from IndexedDB using PhotoService
  - Add fallback logic to default profile image when photo unavailable
  - Handle loading states and error scenarios gracefully
  - Maintain existing styling and responsive behavior
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Implement photo editing functionality
  - Add edit mode support in CVIngestionForm for existing photos
  - Display current photo in PhotoUpload when editing CV
  - Allow photo replacement and removal during CV editing
  - Update PhotoService calls to handle photo updates
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Add photo cleanup and deletion logic
  - Implement photo deletion when CV is deleted
  - Add confirmation dialog for photo removal
  - Clean up orphaned photos in IndexedDB
  - Handle photo deletion errors gracefully
  - _Requirements: 3.4, 6.1, 6.2, 6.3, 6.4_

- [x] 9. Add internationalization support for photo features
  - Create translation keys for photo upload UI text in messages/en.json
  - Add French translations in messages/fr.json
  - Add Portuguese translations in messages/pt.json
  - Include error messages and accessibility labels
  - Test UI text rendering in all supported locales
  - _Requirements: 7.1, 7.3, 7.4_

- [ ] 10. Write comprehensive unit tests for photo functionality
  - Test PhotoUpload component file handling and validation
  - Test CVIngestionForm integration with photo upload
  - Test ProfileImage component with custom photos and fallbacks
  - Test PhotoService IndexedDB operations and error scenarios
  - _Requirements: All requirements - unit testing coverage_

- [ ] 11. Write integration tests for photo workflow
  - Test end-to-end photo upload during CV creation
  - Test photo persistence and retrieval across browser sessions
  - Test photo editing and deletion workflows
  - Test error recovery and fallback scenarios
  - _Requirements: All requirements - integration testing coverage_

- [ ] 12. Add performance optimizations and cleanup
  - Implement Object URL cleanup to prevent memory leaks
  - Add lazy loading for photo previews in CV list
  - Optimize IndexedDB connection management
  - Test performance with multiple large photos
  - _Requirements: 5.1, 5.5, 6.1, 6.5_