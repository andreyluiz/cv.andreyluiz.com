# Implementation Plan

- [ ] 1. Add layout state management to Zustand store
  - Add `layoutMode` property with type `'single' | 'two-column'` to store interface
  - Add `setLayoutMode` action to update layout preference
  - Configure persistence for layout preference in localStorage
  - Set default layout mode to 'single' for backward compatibility
  - _Requirements: 1.3, 1.4_

- [ ] 2. Create LayoutToggle component with accessibility support
  - Create new component in `src/lib/components/ui/LayoutToggle.tsx`
  - Implement toggle button with icons for single/two-column layouts
  - Add proper ARIA labels and keyboard navigation support
  - Use existing Button component styling for consistency
  - Add hover states and visual feedback for user interactions
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 3. Extract ProfileImage component from Header
  - Create new `ProfileImage.tsx` component in resume components directory
  - Move profile image logic from Header component to new component
  - Maintain existing styling and responsive behavior
  - Update Header component to use HeaderContent without profile image
  - Ensure component works in both layout modes
  - _Requirements: 2.1_

- [ ] 4. Create TwoColumnLayout component with Tailwind Grid
  - Create `TwoColumnLayout.tsx` component in resume components directory
  - Implement responsive grid using Tailwind classes: `grid grid-cols-1 md:grid-cols-[minmax(200px,1fr)_2fr]`
  - Add proper gap spacing and alignment with `gap-6 md:gap-8 items-start`
  - Include print-specific classes for proper PDF rendering
  - Accept resumeData prop and distribute content to left/right columns
  - _Requirements: 2.2, 2.4, 3.1, 3.2, 5.1, 5.3_

- [ ] 5. Create LeftColumn component for personal information
  - Create `LeftColumn.tsx` component with flex column layout
  - Include ProfileImage, ContactInfo, and Languages components
  - Use consistent spacing with `flex flex-col gap-6`
  - Ensure proper vertical alignment and responsive behavior
  - Test component renders correctly in isolation
  - _Requirements: 2.1_

- [ ] 6. Create RightColumn component for professional content
  - Create `RightColumn.tsx` component with flex column layout
  - Include HeaderContent, GeneralSkills, Experience, Skills, Education, Projects, Publications
  - Use consistent spacing with `flex flex-col gap-6`
  - Maintain proper section ordering and visual hierarchy
  - Ensure all existing functionality is preserved
  - _Requirements: 2.2_

- [ ] 7. Create HeaderContent component for text-only header
  - Extract name, title, summary, and qualities from Header component
  - Create new `HeaderContent.tsx` component without profile image
  - Maintain existing typography and styling for text elements
  - Ensure component works properly in right column layout
  - Update component to handle responsive text sizing
  - _Requirements: 2.2_

- [ ] 8. Integrate LayoutToggle into Controls component
  - Add LayoutToggle component to existing Controls component
  - Position toggle appropriately within existing control layout
  - Connect toggle to store state management
  - Ensure toggle doesn't interfere with existing controls
  - Test toggle functionality with other control interactions
  - _Requirements: 1.1, 1.2_

- [ ] 9. Update ResumeContent to support layout switching
  - Modify ResumeContent component to conditionally render layouts
  - Add logic to switch between single-column and TwoColumnLayout
  - Ensure smooth transitions between layout modes
  - Preserve all existing functionality for single-column mode
  - Test layout switching with different resume data
  - _Requirements: 1.2, 1.4, 3.3_

- [ ] 10. Implement responsive behavior for mobile devices
  - Add responsive classes to force single-column on mobile regardless of preference
  - Test layout behavior across different screen sizes
  - Ensure mobile experience remains optimal
  - Verify touch interactions work properly on mobile
  - Test print behavior on different devices
  - _Requirements: 5.2, 5.3_

- [ ] 11. Add print optimization for two-column layout
  - Implement print-specific Tailwind classes for proper PDF rendering
  - Test print output for both layout modes
  - Ensure page breaks work correctly in two-column layout
  - Verify print margins and spacing are appropriate
  - Test PDF generation maintains layout integrity
  - _Requirements: 3.4, 5.4_

- [ ] 12. Write comprehensive unit tests for new components
  - Create tests for LayoutToggle component functionality and accessibility
  - Test TwoColumnLayout component rendering and responsive behavior
  - Test ProfileImage, LeftColumn, RightColumn, and HeaderContent components
  - Test store integration for layout preference persistence
  - Verify error handling and fallback scenarios
  - _Requirements: 1.3, 1.4, 4.4_

- [ ] 13. Write integration tests for layout switching
  - Test complete layout switching workflow from user interaction
  - Verify content preservation during layout changes
  - Test responsive behavior across different screen sizes
  - Test print functionality for both layout modes
  - Verify accessibility compliance across all components
  - _Requirements: 1.2, 3.3, 3.4, 5.1, 5.2, 5.3, 5.4_