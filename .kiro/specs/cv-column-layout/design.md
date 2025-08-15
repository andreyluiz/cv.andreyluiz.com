# Design Document

## Overview

The CV Column Layout Toggle feature introduces a flexible layout system that allows users to switch between single-column and two-column resume layouts. The design leverages CSS Grid for precise alignment and maintains the existing component architecture while adding layout-aware rendering logic.

## Architecture

### Component Hierarchy

```
ResumeContent (Layout Container)
├── Controls (includes LayoutToggle)
├── SingleColumnLayout (current implementation)
└── TwoColumnLayout (new implementation)
    ├── LeftColumn
    │   ├── ProfileImage (extracted from Header)
    │   ├── ContactInfo
    │   └── Languages
    └── RightColumn
        ├── HeaderContent (name, title, summary, qualities)
        ├── GeneralSkills
        ├── Experience
        ├── Skills
        ├── Education
        ├── Projects
        └── Publications
```

### State Management

The layout preference will be stored in the Zustand store alongside existing preferences:

```typescript
interface StoreState {
  // ... existing properties
  layoutMode: 'single' | 'two-column';
  setLayoutMode: (mode: 'single' | 'two-column') => void;
}
```

## Components and Interfaces

### 1. LayoutToggle Component

**Purpose**: Provides UI control for switching between layout modes

**Props**:
```typescript
interface LayoutToggleProps {
  currentLayout: 'single' | 'two-column';
  onLayoutChange: (layout: 'single' | 'two-column') => void;
}
```

**Design**: 
- Toggle button with icons representing single/two-column layouts
- Uses existing Button component styling
- Positioned in the Controls component alongside existing controls

### 2. TwoColumnLayout Component

**Purpose**: Renders resume content in a two-column grid layout

**Props**:
```typescript
interface TwoColumnLayoutProps {
  resumeData: Variant;
}
```

**Tailwind Grid Structure**:
```typescript
// Two-column layout classes
const twoColumnClasses = "grid grid-cols-[1fr_2fr] gap-8 items-start";
```

### 3. LeftColumn Component

**Purpose**: Contains personal information and secondary details

**Content**:
- Profile image (extracted from current Header)
- Contact information
- Languages

**Styling**: Fixed width sidebar with consistent spacing

### 4. RightColumn Component

**Purpose**: Contains primary professional content

**Content**:
- Header content (name, title, summary, qualities)
- All professional sections in order

**Styling**: Flexible width main content area

### 5. Modified Header Component

**Changes**:
- Extract profile image logic into separate component
- Create HeaderContent component for text-only content
- Maintain existing styling for single-column mode

## Data Models

### Layout Configuration

```typescript
type LayoutMode = 'single' | 'two-column';

interface LayoutConfig {
  mode: LayoutMode;
  leftColumnSections: string[];
  rightColumnSections: string[];
}
```

### Component Section Mapping

```typescript
const SECTION_MAPPING = {
  leftColumn: ['profileImage', 'contactInfo', 'languages'],
  rightColumn: [
    'headerContent', 
    'generalSkills', 
    'experience', 
    'skills', 
    'education', 
    'projects', 
    'publications'
  ]
} as const;
```

## Error Handling

### Layout Rendering Errors

- **Fallback**: If two-column layout fails to render, automatically fall back to single-column
- **Error Boundary**: Wrap layout components in error boundaries to prevent full page crashes
- **Validation**: Validate layout mode from localStorage before applying

### Responsive Breakpoints

- **Mobile**: Force single-column layout below 768px regardless of user preference
- **Tablet**: Maintain user preference but adjust column ratios
- **Desktop**: Full two-column layout with optimal spacing

## Testing Strategy

### Unit Tests

1. **LayoutToggle Component**
   - Toggle functionality
   - State persistence
   - Accessibility compliance

2. **TwoColumnLayout Component**
   - Proper content distribution
   - CSS Grid implementation
   - Responsive behavior

3. **Store Integration**
   - Layout preference persistence
   - State updates

### Integration Tests

1. **Layout Switching**
   - Seamless transition between layouts
   - Content preservation during switch
   - Print layout consistency

2. **Responsive Behavior**
   - Mobile layout adaptation
   - Print media queries
   - Cross-browser compatibility

### Visual Regression Tests

1. **Layout Alignment**
   - Grid alignment verification
   - Typography consistency
   - Spacing uniformity

2. **Print Output**
   - PDF generation accuracy
   - Page break handling
   - Layout preservation

## Implementation Approach

### Phase 1: Core Infrastructure
- Add layout state to Zustand store
- Create LayoutToggle component
- Implement basic two-column grid structure

### Phase 2: Content Distribution
- Extract ProfileImage from Header
- Create LeftColumn and RightColumn components
- Implement section mapping logic

### Phase 3: Styling and Alignment
- Implement CSS Grid with proper alignment
- Add responsive breakpoints
- Ensure print compatibility

### Phase 4: Polish and Testing
- Add transitions and animations
- Implement error boundaries
- Comprehensive testing across devices

## Tailwind CSS Implementation

### Grid Structure

The two-column layout will use Tailwind's grid utilities:

```typescript
// Main container classes
const twoColumnClasses = "grid grid-cols-[minmax(200px,1fr)_2fr] gap-8 items-start";

// Column classes
const leftColumnClasses = "flex flex-col gap-6";
const rightColumnClasses = "flex flex-col gap-6";
```

### Responsive Classes

```typescript
// Responsive grid that collapses on mobile
const responsiveGridClasses = "grid grid-cols-1 md:grid-cols-[minmax(200px,1fr)_2fr] gap-6 md:gap-8 items-start";

// Print-specific adjustments
const printClasses = "print:grid-cols-[1fr_2fr] print:gap-4";
```

### Alignment Strategy

- Use Tailwind's `items-start` to prevent stretching
- Implement consistent spacing with `gap-6` utilities
- Leverage CSS Grid's natural alignment for horizontal section title alignment
- Use responsive prefixes (`md:`, `print:`) for different screen sizes