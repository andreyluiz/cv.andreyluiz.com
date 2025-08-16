# Design Document

## Overview

The CV Ingestion feature extends the existing CV tailor application with the ability to manage multiple CVs. Users can import raw CV text, have it automatically formatted by AI into the application's JSON structure, and switch between different CV versions. The feature integrates seamlessly with the existing architecture while adding persistent storage for user-created CVs.

## Architecture

### High-Level Architecture

The feature follows the existing application patterns:
- **Client-side state management** using Zustand with persistence
- **Server Actions** for AI processing using the existing OpenAI integration
- **Modal-based UI** following the established modal patterns
- **Internationalization** using next-intl for all user-facing text

### Data Flow

```mermaid
graph TD
    A[User clicks "My CVs" button] --> B[CV Management Modal opens]
    B --> C{User action}
    C -->|Load CV| D[Close modal, display selected CV]
    C -->|Ingest New CV| E[Show ingestion form]
    C -->|Edit CV| F[Show form with pre-filled data]
    C -->|Delete CV| G[Confirm and remove from storage]
    E --> H[User submits raw text]
    F --> H
    H --> I[Call AI via server action]
    I --> J[AI formats text to JSON]
    J --> K[Save to persistent storage]
    K --> L[Return to CV list]
```

## Components and Interfaces

### New Components

#### 1. CVManagementModal
**Location**: `src/lib/components/modals/CVManagementModal.tsx`

**Purpose**: Main modal component that orchestrates the CV management interface

**Props**:
```typescript
interface CVManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCVLoad: (cv: Variant) => void;
}
```

**States**:
- `list`: Display list of available CVs
- `ingesting`: Show ingestion form for new CV
- `editing`: Show edit form for existing CV
- `processing`: Show loading state during AI processing

#### 2. CVListView
**Location**: `src/lib/components/modals/CVListView.tsx`

**Purpose**: Displays the list of available CVs with action buttons

**Props**:
```typescript
interface CVListViewProps {
  cvs: IngestedCV[];
  defaultCV: Variant;
  onLoadCV: (cv: Variant) => void;
  onEditCV: (cv: IngestedCV) => void;
  onDeleteCV: (id: string) => void;
  onIngestNew: () => void;
}
```

#### 3. CVIngestionForm
**Location**: `src/lib/components/modals/CVIngestionForm.tsx`

**Purpose**: Form for inputting CV title and raw text

**Props**:
```typescript
interface CVIngestionFormProps {
  initialData?: { title: string; rawText: string };
  onSubmit: (data: { title: string; rawText: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}
```

#### 4. MyCVsButton
**Location**: `src/lib/components/ui/MyCVsButton.tsx`

**Purpose**: Button component to open the CV management modal

### Updated Components

#### Store Enhancement
**Location**: `src/lib/store.ts`

Add CV management state:
```typescript
interface CVState {
  ingestedCVs: IngestedCV[];
  currentCV: Variant | null;
  addIngestedCV: (cv: IngestedCV) => void;
  updateIngestedCV: (id: string, cv: IngestedCV) => void;
  deleteIngestedCV: (id: string) => void;
  setCurrentCV: (cv: Variant) => void;
}
```

#### Server Actions Enhancement
**Location**: `src/lib/server/actions.ts`

Add new server action:
```typescript
export async function ingestCV(
  rawText: string,
  apiKey: string,
  selectedModel: string,
  language: string = "en"
): Promise<Variant>
```

## Data Models

### IngestedCV Interface
```typescript
interface IngestedCV {
  id: string;
  title: string;
  rawText: string;
  formattedCV: Variant;
  createdAt: Date;
  updatedAt: Date;
}
```

### Storage Structure
The persistent storage will use the existing Zustand persistence mechanism:

```typescript
{
  // Existing store data...
  ingestedCVs: IngestedCV[];
  currentCV: Variant | null;
}
```

## Error Handling

### AI Processing Errors
- **Network errors**: Retry with exponential backoff (following existing pattern)
- **Authentication errors**: Clear error message directing to API key settings
- **Quota errors**: Inform user about limits and suggest free models
- **Validation errors**: Show specific validation messages

### Storage Errors
- **Storage full**: Inform user and suggest deleting old CVs
- **Corruption**: Graceful fallback to default CV

### Input Validation
- **Title**: Required, 1-100 characters
- **Raw text**: Required, 50-50000 characters
- **Duplicate titles**: Auto-append number suffix

## Testing Strategy

### Unit Tests
- **CVManagementModal**: State transitions and user interactions
- **CVListView**: Rendering and action button functionality
- **CVIngestionForm**: Form validation and submission
- **Store actions**: CV CRUD operations and persistence

### Integration Tests
- **End-to-end CV ingestion flow**: From raw text to formatted CV
- **CV switching**: Loading different CVs and updating main view
- **Persistence**: Data survival across browser sessions
- **AI integration**: Mock server actions for reliable testing

### Accessibility Tests
- **Keyboard navigation**: Tab order and focus management
- **Screen reader compatibility**: ARIA labels and announcements
- **Color contrast**: Ensure all UI elements meet WCAG standards
- **Mobile usability**: Touch targets and responsive behavior

## Internationalization

### New Translation Keys
Add to `messages/{locale}.json`:

```json
{
  "cvManagement": {
    "modal": {
      "title": "My CVs",
      "ingestNew": "Ingest New CV",
      "defaultCV": "Default CV",
      "noIngestedCVs": "No ingested CVs yet"
    },
    "form": {
      "title": "CV Title",
      "titlePlaceholder": "Enter a name for this CV",
      "rawText": "Raw CV Text",
      "rawTextPlaceholder": "Paste your CV text here...",
      "submit": "Process CV",
      "cancel": "Cancel",
      "processing": "Processing CV..."
    },
    "actions": {
      "load": "Load CV",
      "edit": "Edit CV",
      "delete": "Delete CV",
      "confirmDelete": "Are you sure you want to delete this CV?"
    },
    "errors": {
      "titleRequired": "CV title is required",
      "titleTooLong": "CV title must be less than 100 characters",
      "rawTextRequired": "CV text is required",
      "rawTextTooShort": "CV text must be at least 50 characters",
      "rawTextTooLong": "CV text must be less than 50,000 characters",
      "processingFailed": "Failed to process CV",
      "storageError": "Failed to save CV"
    }
  }
}
```

## AI Integration

### Prompt Engineering
The CV ingestion will use a specialized prompt that instructs the AI to:

1. **Parse raw text structure**: Identify sections like experience, education, skills
2. **Extract information**: Pull out relevant data points
3. **Format to JSON**: Structure according to the existing Variant interface
4. **Maintain consistency**: Ensure all required fields are populated
5. **Handle missing data**: Provide reasonable defaults for optional fields

### Example Prompt Structure
```
You are a CV formatting assistant. Convert the following raw CV text into a structured JSON format.

The JSON must follow this exact structure: [Variant interface]

Raw CV text:
{rawText}

Instructions:
- Extract all relevant information from the raw text
- If information is missing, use appropriate defaults
- Maintain the original meaning and content
- Format dates consistently (YYYY-MM format)
- Organize skills into appropriate domains
- Return only valid JSON, no additional text
```

## Performance Considerations

### Lazy Loading
- Modal components loaded only when needed
- CV list virtualization for large numbers of ingested CVs

### Storage Optimization
- Compress stored CV data using JSON.stringify optimization
- Implement storage cleanup for old/unused CVs
- Monitor storage usage and warn users approaching limits

### AI Request Optimization
- Debounce rapid successive requests
- Cache recent AI responses to avoid duplicate processing
- Implement request cancellation for abandoned operations

## Security Considerations

### Data Privacy
- All CV data stored locally in browser
- No server-side storage of personal information
- Clear data export/import functionality for user control

### Input Sanitization
- Validate and sanitize all user inputs
- Prevent XSS through proper text handling
- Limit file size and content length

### API Security
- API keys remain client-side only
- Use existing secure API communication patterns
- Implement rate limiting awareness