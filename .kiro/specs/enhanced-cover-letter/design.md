# Design Document

## Overview

The enhanced cover letter feature transforms the current simple cover letter generation into a comprehensive, company-specific system. The design introduces a new modal interface for collecting company information, implements a structured cover letter format, adds persistence for generated letters, and supports both targeted job applications and spontaneous applications.

The system maintains the existing OpenRouter/OpenAI integration while enhancing the prompting strategy to generate more professional, structured cover letters that follow business letter conventions.

## Architecture

### Component Architecture

```
ResumeTailor (existing)
├── Enhanced CoverLetterModal (modified)
│   ├── CoverLetterInputForm (new)
│   │   ├── JobPositionInput (optional)
│   │   ├── CompanyDescriptionInput (required)
│   │   ├── JobDescriptionInput (optional)
│   │   └── InfoBox (spontaneous application guidance)
│   ├── CoverLetterDisplay (new)
│   │   ├── CoverLetterContent (formatted display)
│   │   └── RegenerateButton
│   └── LoadingState (existing)
```

### Data Flow

1. **Input Collection**: Modal collects company information through form
2. **Validation**: Ensures minimum required information (company description)
3. **Generation**: Enhanced AI service generates structured cover letter
4. **Persistence**: Store generated letter and input data in application state
5. **Display**: Show formatted cover letter with regeneration option

### State Management

The enhanced system extends the existing Zustand store to include cover letter persistence:

```typescript
interface CoverLetterState {
  generatedCoverLetter: string | null;
  coverLetterInputs: {
    jobPosition: string;
    companyDescription: string;
    jobDescription: string;
  } | null;
  setCoverLetter: (letter: string, inputs: CoverLetterInputs) => void;
  clearCoverLetter: () => void;
}
```

## Components and Interfaces

### Enhanced CoverLetterModal

**Purpose**: Main modal component that orchestrates the cover letter generation workflow

**Key Features**:
- Two-phase UI: input collection → letter display
- Persistence of generated content
- Support for regeneration with saved inputs
- Loading states and error handling

**Props**:
```typescript
interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: Variant;
  apiKey: string;
  selectedModel: string;
}
```

### CoverLetterInputForm

**Purpose**: Collects company and job information from user

**Key Features**:
- Optional job position field
- Required company description field
- Optional job description field
- Information box explaining spontaneous applications
- Form validation ensuring company description is provided

**State**:
```typescript
interface FormState {
  jobPosition: string;
  companyDescription: string;
  jobDescription: string;
  isValid: boolean;
}
```

### CoverLetterDisplay

**Purpose**: Shows generated cover letter with formatting and regeneration options

**Key Features**:
- Formatted display of cover letter content
- Regenerate button that reopens input form with saved data
- Print-friendly styling
- Proper typography for business letter format

## Data Models

### CoverLetterInputs

```typescript
interface CoverLetterInputs {
  jobPosition: string;
  companyDescription: string;
  jobDescription: string;
}
```

### Enhanced Store State

```typescript
interface StoreState {
  // Existing fields...
  apiKey: string;
  selectedModel: string;
  
  // New cover letter fields
  generatedCoverLetter: string | null;
  coverLetterInputs: CoverLetterInputs | null;
  
  // New methods
  setCoverLetter: (letter: string, inputs: CoverLetterInputs) => void;
  clearCoverLetter: () => void;
}
```

## Error Handling

### Input Validation
- **Missing Company Description**: Show validation error, prevent submission
- **Empty Form**: Disable generate button until minimum requirements met

### AI Generation Errors
- **API Failures**: Display user-friendly error messages with retry option
- **Invalid Responses**: Fallback to basic generation or show error
- **Rate Limiting**: Show appropriate error with model switching suggestions

### Persistence Errors
- **Storage Failures**: Graceful degradation, show warning but allow continued use
- **State Corruption**: Clear corrupted data and restart flow

## Testing Strategy

### Unit Tests

**CoverLetterInputForm**:
- Form validation logic
- Input handling and state updates
- Submission behavior with different input combinations

**CoverLetterDisplay**:
- Content rendering
- Regeneration flow
- Formatting and styling

**Enhanced Store**:
- Cover letter persistence
- State management operations
- Data serialization/deserialization

### Integration Tests

**Modal Workflow**:
- Complete flow from input to display
- Regeneration with saved inputs
- Modal state transitions

**AI Integration**:
- Cover letter generation with different input combinations
- Error handling for various API failure scenarios
- Language-specific generation

**Persistence**:
- Data persistence across browser sessions
- State recovery after page refresh

### End-to-End Tests

**Complete User Journey**:
- Open modal → fill form → generate letter → close modal → reopen → regenerate
- Spontaneous application flow (no job title/description)
- Multi-language cover letter generation

## Implementation Considerations

### Internationalization
- All UI text must be translatable
- Cover letter generation respects current locale
- Date formatting follows locale conventions
- Business letter format adapts to cultural norms

### Performance
- Lazy loading of modal components
- Debounced input validation
- Efficient state updates to prevent unnecessary re-renders

### Accessibility
- Proper form labeling and ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Focus management in modal

### Mobile Responsiveness
- Modal adapts to smaller screens
- Touch-friendly input controls
- Readable text sizing on mobile devices

## AI Prompt Enhancement

### System Prompt Structure

The enhanced system prompt will include:
1. **Role Definition**: Professional cover letter writer
2. **Format Requirements**: Specific structure with candidate info, company info, title, paragraphs
3. **Content Guidelines**: Company flattery, personal background, collaboration vision, interview request
4. **Language Specification**: Generate in user's selected language
5. **Spontaneous Application Handling**: Special instructions when job details are missing

### User Prompt Structure

```
Job Position: [position or "Not specified for spontaneous application"]
Company Description: [user-provided company information]
Job Description: [description or "Not provided - spontaneous application"]
Language: [current locale]
Candidate Resume: [JSON resume data]
```

### Quality Assurance

- Validate generated content follows required structure
- Ensure appropriate tone and professionalism
- Verify language consistency with selected locale
- Check for proper business letter formatting