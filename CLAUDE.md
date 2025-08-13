# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is an AI-powered CV tailor application built with Next.js 15.3.1, TypeScript 5, and React 19. The application helps users adapt resumes to job descriptions and generate cover letters using OpenAI API integration.

The `.kiro/steering/` directory contains files that describe the architecture and patterns used in the project:
- `product.md` - Product overview and key features
- `structure.md` - Directory layout and architectural patterns  
- `tech.md` - Technology stack and development commands

## Development Commands

### Essential Commands
```bash
# Development
bun run dev          # Start development server with Turbopack
bun run build        # Build for production
bun run start        # Start production server

# Code Quality
bun run lint         # Run Biome linting
bun run format       # Format code with Biome
bun run typecheck    # TypeScript type checking

# Testing
bun run test         # Run tests in watch mode
bun run test:run     # Run tests once
bunx vitest run path/to/specific.test.tsx  # Run single test file

# Package Management (use Bun, not npm/yarn)
bun install         # Install dependencies
bun add <package>   # Add dependency
```

## Architecture Overview

### Core Technologies
- **Runtime**: Bun (preferred package manager and runtime)
- **Framework**: Next.js 15.3.1 with App Router
- **Styling**: Tailwind CSS v4 with dark mode support
- **State**: Zustand with persistence
- **UI**: Headless UI components with class-variance-authority
- **i18n**: next-intl for English, French, Portuguese support
- **AI**: OpenAI API integration via OpenRouter
- **Testing**: Vitest with jsdom environment
- **Linting**: Biome (preferred over ESLint/Prettier)

### Key Architectural Patterns

**Component Organization**:
- `src/lib/components/ui/` - Generic, reusable UI components
- `src/lib/components/modals/` - Modal dialogs
- `src/lib/components/resume/` - Resume-specific feature components
- `src/lib/components/providers/` - Context providers

**Data Architecture**:
- Static resume data in `src/lib/server/resume-{locale}.json`
- Client state via Zustand store (`src/lib/store.ts`)
- Server actions for AI operations (`src/lib/server/actions.ts`)
- OpenAI integration (`src/lib/server/openai.ts`)

**Internationalization**:
- Locale-based routing with `[locale]` dynamic segments
- Translation files in `messages/` directory (en.json, fr.json, pt.json)
- Configuration in `src/i18n/` directory
- Easy extensibility for new languages

**Type System**:
- Centralized types in `src/lib/types.ts`
- Strong typing for domain models (Variant, Experience, Education, etc.)
- Strict TypeScript configuration with type checking

## Development Patterns

### File Naming
- Components: PascalCase (e.g., `ResumeContent.tsx`)
- Utilities: camelCase (e.g., `utils.ts`) 
- Server data: kebab-case (e.g., `resume-en.json`)

### Import Conventions
- Use `@/` alias for src imports
- Group imports: external libraries first, then internal modules
- Prefer named exports for utilities

### Component Patterns
- Functional components with TypeScript
- Props interfaces defined at component top
- Use of `class-variance-authority` for component variants
- Utility `cn` function for class merging (`clsx` + `tailwind-merge`)

### Styling Approach
- Tailwind CSS utility classes
- Dark mode with `dark:` variants
- Print-specific styles with `print:` variants
- Component variants via `cva`

## State Management

**Zustand Store** (`src/lib/store.ts`):
- API keys and model selection
- Cover letter state and inputs with persistence
- Client-side preferences

**Server State**:
- Resume data loaded from JSON files per locale
- AI operations handled via Next.js server actions

## AI Integration

The application uses OpenAI API (via OpenRouter) for:
- Resume tailoring based on job descriptions
- Cover letter generation with company-specific information
- Enhanced prompting strategies for better output quality

API configuration is stored client-side in Zustand with persistence.

## Testing

**Setup**: Vitest with jsdom environment, React Testing Library
**Test Location**: `**/__tests__/**` directories
**Configuration**: `vitest.config.ts` with setup file at `src/test/setup.ts`

Key testing patterns:
- Component rendering and interaction tests
- Form validation and state management
- Internationalization testing with mock translations
- Server action testing

## Environment Setup

**Required Environment Variables**:
- `NEXT_PUBLIC_SITE_URL` - Used for OpenRouter HTTP-Referer header

**Development Setup**:
1. Clone repository
2. `bun install` 
3. Copy `.env.example` to `.env.local`
4. `bun run dev`

The application is designed for easy forking and customization, with resume data stored in editable JSON files and extensive TypeScript typing for safety.