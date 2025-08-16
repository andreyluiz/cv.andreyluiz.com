---
inclusion: always
---

# Technology Stack & Development Guidelines

## Core Technologies

### Framework & Runtime
- **Next.js 15.3.1** with App Router - Use server components by default
- **React 19** - Leverage concurrent features and new hooks
- **TypeScript 5** with strict mode - All code must be fully typed
- **Bun** - REQUIRED for package management and runtime (never use npm/yarn)

### Styling & UI Standards
- **Tailwind CSS v4** - Use utility classes, avoid custom CSS when possible
- **Headless UI** - For accessible, unstyled components
- **Heroicons** - Consistent icon usage across the app
- **next-themes** - Theme switching implementation
- **class-variance-authority** - Type-safe component variants

### State & Data Management
- **Zustand** with persistence - For user preferences and API keys only
- **next-intl** - All user-facing text must be internationalized
- **OpenAI API** - Server-side only, never expose keys client-side

### Testing Stack
- **Vitest** - Fast unit test runner with native TypeScript support
- **Testing Library** - React Testing Library for component testing
- **jsdom** - DOM environment for testing browser APIs
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom Jest matchers for DOM testing

## Development Rules

### Code Quality Requirements
- **Biome** for linting and formatting (preferred over ESLint/Prettier)
- **TypeScript strict mode** - No `any` types allowed
- All components must be accessible (ARIA compliant)
- Use named exports (avoid default exports)
- A task should only be completely after all quality checks (linting, types, and tests) are passing

### Package Management Commands
```bash
bun install         # Install dependencies
bun add <package>   # Add new dependency  
bun remove <package> # Remove dependency
```

### Development Workflow
```bash
bun run dev          # Start development with Turbopack
bun run build        # Production build
bun run lint         # Code linting
bun run typecheck    # Type checking
bun run test         # Run tests in watch mode
bun run test:run     # Run tests once
```

## Architecture Patterns

### Next.js App Router Usage
- Use Server Components by default
- Client Components only when necessary (interactivity, hooks)
- Leverage file-based routing with internationalized `[locale]` segments
- Server Actions for all AI operations and data mutations

### Performance Guidelines
- Optimize for Core Web Vitals
- Use Turbopack for fast development builds
- Implement proper loading states for async operations
- Minimize client-side JavaScript bundle size
