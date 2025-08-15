---
inclusion: always
---

# Project Structure & Architecture Guidelines

## Directory Structure Rules

When working with this codebase, follow these strict organizational patterns:

### Core Directories
- `src/app/[locale]/` - Next.js App Router with internationalized routes
- `src/lib/components/` - All React components organized by purpose
- `src/lib/server/` - Server-side code including actions and data
- `messages/` - Translation files (en.json, fr.json, pt.json)

### Component Placement Rules
- **UI components** → `src/lib/components/ui/` (Button, Input, etc.)
- **Resume components** → `src/lib/components/resume/` (Experience, Skills, etc.)
- **Modal components** → `src/lib/components/modals/` (ApiKeyModal, etc.)
- **Provider components** → `src/lib/components/providers/` (ThemeProvider, etc.)

### Data & State Management
- **Resume data** → `src/lib/server/resume-{locale}.json` files
- **Global state** → `src/lib/store.ts` (Zustand)
- **Types** → `src/lib/types.ts` (centralized TypeScript definitions)
- **Server actions** → `src/lib/server/actions.ts`

## Code Organization Rules

### File Naming Conventions
- **React components**: PascalCase (e.g., `ResumeContent.tsx`)
- **Utility files**: camelCase (e.g., `utils.ts`, `api.ts`)
- **Data files**: kebab-case (e.g., `resume-en.json`)
- **Test files**: `ComponentName.test.tsx` or `filename.test.ts`

### Import Patterns (REQUIRED)
```typescript
// 1. External libraries first
import React from 'react'
import { useTranslations } from 'next-intl'

// 2. Internal imports using @/ alias
import { Button } from '@/lib/components/ui/Button'
import { useStore } from '@/lib/store'
```

### Component Structure Rules
- Use named exports for components (not default exports)
- Place interfaces/types above the component definition
- Group related functionality in the same file when appropriate

## Internationalization Architecture

### Translation Key Structure
- Use nested keys: `"resume.experience.title"`
- Keep keys descriptive and hierarchical
- Add translations to ALL supported locales: `en`, `fr`, `pt`

### Locale-Specific Data
- Resume data files: `resume-en.json`, `resume-fr.json`, `resume-pt.json`
- Must maintain identical structure across all locales
- Use `[locale]` dynamic routing for internationalized pages

## State Management Patterns

### Zustand Store Usage
- Store API keys and user preferences only
- Use persistence for settings that should survive page reloads
- Keep resume data in JSON files, not in global state

### Server Actions
- All AI operations must use Next.js server actions
- Place in `src/lib/server/actions.ts`
- Handle errors gracefully with proper user feedback

## Testing Organization
- Component tests: `__tests__/ComponentName.test.tsx`
- Integration tests: `__tests__/integration.test.ts`
- Place tests in `__tests__` folders within the relevant directory
