# Project Structure & Organization

## Directory Layout

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   │   ├── layout.tsx     # Root layout with providers
│   │   └── page.tsx       # Main resume page
│   ├── globals.css        # Global styles and Tailwind imports
│   └── favicon.ico        # App icon
├── i18n/                  # Internationalization config
│   ├── navigation.ts      # Typed navigation helpers
│   ├── request.ts         # Server-side i18n setup
│   └── routing.ts         # Locale routing configuration
├── lib/                   # Shared utilities and components
│   ├── components/        # React components
│   │   ├── modals/        # Modal dialogs
│   │   ├── providers/     # Context providers
│   │   ├── resume/        # Resume-specific components
│   │   └── ui/            # Reusable UI components
│   ├── server/            # Server-side code
│   │   ├── actions.ts     # Server actions
│   │   ├── openai.ts      # OpenAI API integration
│   │   └── resume-*.json  # Resume data by locale
│   ├── api.ts             # Client-side API helpers
│   ├── lang.ts            # Language utilities
│   ├── store.ts           # Zustand state management
│   ├── types.ts           # TypeScript type definitions
│   └── utils.ts           # Utility functions
└── middleware.ts          # Next.js middleware for i18n

messages/                  # Translation files
├── en.json               # English translations
├── fr.json               # French translations
└── pt.json               # Portuguese translations

public/                   # Static assets
└── profile.png          # Profile image
```

## Architecture Patterns

### Component Organization
- **UI Components**: Generic, reusable components in `src/lib/components/ui/`
- **Feature Components**: Domain-specific components in `src/lib/components/resume/`
- **Modal Components**: Dialog components in `src/lib/components/modals/`
- **Provider Components**: Context providers in `src/lib/components/providers/`

### Data Flow
- **Resume Data**: Static JSON files in `src/lib/server/` by locale
- **Client State**: Zustand store for API keys and UI state
- **Server Actions**: AI operations and data processing in `src/lib/server/actions.ts`
- **Types**: Centralized TypeScript definitions in `src/lib/types.ts`

### Internationalization
- **Routing**: Locale-based routing with `[locale]` dynamic segments
- **Messages**: Translation files in `messages/` directory
- **Configuration**: i18n setup in `src/i18n/` directory
- **Supported Locales**: `en`, `fr`, `pt` (easily extensible)

## File Naming Conventions
- **Components**: PascalCase (e.g., `ResumeContent.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`)
- **Types**: camelCase with descriptive names (e.g., `types.ts`)
- **Server files**: kebab-case for data files (e.g., `resume-en.json`)

## Import Patterns
- Use `@/` alias for imports from `src/` directory
- Group imports: external libraries, then internal modules
- Prefer named exports over default exports for utilities