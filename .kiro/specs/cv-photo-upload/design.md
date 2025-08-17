# Design Document

## Overview

The CV Photo Upload feature extends the existing CV ingestion system by adding photo upload capabilities to the CVIngestionForm component. Users will be able to upload, preview, edit, and delete profile photos that are associated with their ingested CVs. Photos will be stored as base64-encoded strings in browser localStorage alongside the CV data, and the ProfileImage component will be enhanced to display custom photos when available.

## Architecture

### Data Flow
1. User selects photo in CVIngestionForm → File validation → Base64 conversion → Preview display
2. Form submission → Photo data included in IngestedCV object → Stored in Zustand store with persistence
3. CV loading → Photo data retrieved → ProfileImage component displays custom photo or fallback

### Storage Strategy
- Photos stored as Blob objects in IndexedDB for efficient binary data handling
- Separate photo storage from CV metadata to avoid localStorage size limits
- Photo references stored in IngestedCV objects with photo IDs linking to IndexedDB entries
- Hybrid approach: CV metadata in localStorage (Zustand), photos in IndexedDB

## Components and Interfaces

### Enhanced Data Models

#### IngestedCV Interface Extension
```typescript
export interface IngestedCV {
  id: string;
  title: string;
  rawText: string;
  formattedCV: Variant;
  createdAt: Date;
  updatedAt: Date;
  profilePhotoId?: string; // Reference to photo stored in IndexedDB
}
```

### New Components

#### PhotoUpload Component
**Location:** `src/lib/components/ui/PhotoUpload.tsx`

**Purpose:** Reusable photo upload component with drag-and-drop, file validation, and preview

**Props:**
```typescript
interface PhotoUploadProps {
  value?: string; // Photo ID or data URL for preview
  onChange: (photoId: string | null) => void;
  disabled?: boolean;
  error?: string;
}
```

**Features:**
- Drag and drop file upload area
- Click to browse file picker
- Image preview with remove option
- File type validation (JPEG, PNG, WebP)
- File size validation (max 2MB)
- Loading states during processing
- Accessibility support with ARIA labels
- IndexedDB integration for photo storage

#### PhotoService
**Location:** `src/lib/services/photoService.ts`

**Purpose:** Service layer for IndexedDB photo operations

**Methods:**
```typescript
interface PhotoService {
  storePhoto(file: File, cvId: string): Promise<string>; // Returns photo ID
  getPhoto(photoId: string): Promise<Blob | null>;
  deletePhoto(photoId: string): Promise<void>;
  deletePhotosByCvId(cvId: string): Promise<void>;
  getPhotoUrl(photoId: string): Promise<string | null>; // Returns object URL
}
```

### Enhanced Components

#### CVIngestionForm Enhancement
**Changes:**
- Add PhotoUpload component between title and rawText fields
- Extend form state to include photo data
- Add photo validation to form validation logic
- Include photo in form submission data

#### ProfileImage Enhancement
**Changes:**
- Accept optional `photoId` prop for custom photo lookup
- Load photo from IndexedDB when photoId provided
- Fallback to default `/profile.png` when no custom photo or load fails
- Maintain existing styling and responsive behavior
- Add error handling for broken custom images and IndexedDB failures

## Data Models

### Photo Data Structure
```typescript
interface PhotoRecord {
  id: string;          // Unique photo identifier
  blob: Blob;          // Binary image data
  type: string;        // MIME type (image/jpeg, image/png, etc.)
  size: number;        // File size in bytes
  uploadedAt: Date;    // Upload timestamp
  cvId: string;        // Associated CV identifier
}
```

### Form Data Extension
```typescript
interface CVFormData {
  title: string;
  rawText: string;
  photoId?: string | null; // Reference to photo in IndexedDB
}
```

### IndexedDB Schema
```typescript
interface PhotoDB extends DBSchema {
  photos: {
    key: string;
    value: PhotoRecord;
    indexes: { 'by-cv': string };
  };
}
```

### Store State Extension
No changes needed to store interface - photo IDs are embedded in IngestedCV objects

## Error Handling

### File Validation Errors
- **Invalid file type:** "Please select a valid image file (JPEG, PNG, or WebP)"
- **File too large:** "Image file must be smaller than 2MB"
- **Upload failed:** "Failed to process image. Please try again"
- **Corrupted file:** "Invalid image file. Please select a different image"

### Runtime Errors
- **Photo display failure:** Graceful fallback to default profile image
- **IndexedDB unavailable:** Clear error message with guidance
- **Storage quota exceeded:** Clear error message with guidance to remove old photos
- **Photo retrieval failure:** User-friendly error with retry option

### Accessibility Errors
- Screen reader announcements for upload status
- Keyboard navigation error handling
- Focus management during error states

## Testing Strategy

### Unit Tests

#### PhotoUpload Component Tests
- File selection and validation
- Drag and drop functionality
- Preview display and removal
- Error state handling
- Accessibility compliance

#### CVIngestionForm Tests
- Photo integration with existing form logic
- Form validation with photo data
- Submission with photo included
- Edit mode with existing photo

#### ProfileImage Tests
- Custom photo display
- Fallback to default image
- Error handling for broken images
- Responsive behavior maintenance

### Integration Tests

#### End-to-End Photo Flow
- Upload photo during CV creation
- Photo persistence across browser sessions
- Photo display in resume view
- Photo editing and removal
- CV deletion removes associated photo

#### Storage Integration
- Photo data stored in IndexedDB, references in localStorage
- IndexedDB quota handling and error recovery
- Cross-storage consistency between localStorage and IndexedDB
- Data migration compatibility

### Performance Tests
- Large image file handling
- IndexedDB read/write performance
- Memory usage with multiple photos
- Object URL creation and cleanup
- Storage size impact assessment

## Implementation Considerations

### File Size Management
- 2MB limit balances quality and storage efficiency
- IndexedDB stores binary data efficiently without base64 overhead
- Consider image compression for large files
- IndexedDB provides much larger storage capacity (typically 50% of available disk space)

### Browser Compatibility
- IndexedDB support (IE10+, all modern browsers)
- FileReader API support (IE10+)
- Blob and Object URL support (IE10+)
- Drag and drop API support (IE11+)
- IndexedDB storage limits much more generous than localStorage

### Performance Optimization
- Lazy loading of photo previews
- Debounced file validation
- Efficient binary data storage in IndexedDB
- Object URL cleanup after component unmount
- Connection pooling for IndexedDB operations

### Security Considerations
- Client-side file type validation only (not security-critical)
- No server-side storage reduces attack surface
- Binary blob storage prevents script injection
- File size limits prevent storage abuse
- IndexedDB same-origin policy provides isolation

## Migration Strategy

### Backward Compatibility
- Existing IngestedCV objects without profilePhotoId property remain functional
- ProfileImage component gracefully handles missing photo IDs
- PhotoService handles missing IndexedDB gracefully
- No data migration required for existing users

### Rollout Plan
1. Deploy enhanced components with feature flag
2. Test with subset of users
3. Monitor storage usage and performance
4. Full rollout after validation

## Internationalization

### New Translation Keys
```typescript
// Photo upload related
"cvManagement.photo.upload": "Upload Photo"
"cvManagement.photo.dragDrop": "Drag and drop an image here, or click to browse"
"cvManagement.photo.remove": "Remove Photo"
"cvManagement.photo.preview": "Photo Preview"

// Error messages
"cvManagement.errors.photoTooLarge": "Image file must be smaller than 2MB"
"cvManagement.errors.photoInvalidType": "Please select a valid image file (JPEG, PNG, or WebP)"
"cvManagement.errors.photoUploadFailed": "Failed to process image. Please try again"

// Accessibility
"cvManagement.photo.alt": "Profile photo preview"
"cvManagement.photo.removeAlt": "Remove uploaded photo"
```

### Localization Requirements
- All photo-related UI text must be translatable
- Error messages in all supported languages (en, fr, pt)
- Accessibility labels for screen readers
- File size limits displayed in user's locale