# Technology Stack

## Framework & Runtime

- **Next.js 15.3.1** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety and development experience
- **Bun** - Package manager and runtime (preferred over npm/yarn)

## Styling & UI

- **Tailwind CSS v4** - Utility-first CSS framework
- **Headless UI** - Unstyled, accessible UI components
- **Heroicons** - Icon library
- **next-themes** - Theme switching (light/dark mode)
- **class-variance-authority** - Component variant management

## State Management & Data

- **Zustand** - Lightweight state management with persistence
- **next-intl** - Internationalization (i18n) support
- **OpenAI API** - AI-powered resume tailoring and cover letter generation

## Code Quality & Formatting

- **Biome** - Fast linter and formatter (preferred over ESLint/Prettier)
- **TypeScript strict mode** - Enhanced type checking
- **ESLint** - Additional linting rules

## Common Commands

### Development

```bash
bun run dev          # Start development server with Turbopack
bun run build        # Build for production
bun run start        # Start production server
```

### Code Quality

```bash
bun run lint         # Run Next.js linting
bun run format       # Format code with Prettier
bun run typecheck    # Type checking without emit
```

### Package Management

```bash
bun install         # Install dependencies
bun add <package>   # Add new dependency
bun remove <package> # Remove dependency
```

## Build System

- Uses Next.js App Router with file-based routing
- Turbopack for fast development builds
- Static optimization for production builds
- Supports internationalized routing with locale prefixes
