---
inclusion: always
---

# Product Overview & Development Guidelines

This is an AI-powered CV tailor application that helps users adapt their resumes to specific job descriptions using OpenAI API integration.

## Core Features

- **Resume Tailoring**: AI-powered customization based on job descriptions
- **Cover Letter Generation**: Personalized cover letters with job matching
- **Multi-language Support**: English, French, Portuguese (easily extensible)
- **Theme Support**: Light/dark modes with system preference detection
- **Print Optimization**: Layouts designed for PDF generation and printing

## Development Principles

### User Experience
- Prioritize accessibility and keyboard navigation
- Maintain responsive design across all screen sizes
- Ensure print layouts are professional and clean
- Keep UI interactions intuitive and fast

### Data Handling
- Resume data is stored in locale-specific JSON files (`resume-{locale}.json`)
- API keys are stored locally in browser storage (never server-side)
- All AI operations happen server-side via Next.js server actions
- State management uses Zustand with persistence for user preferences

### Internationalization Rules
- All user-facing text must be translatable via `next-intl`
- Add new translations to all supported locales (`en`, `fr`, `pt`)
- Use typed translation keys for compile-time safety
- Locale-specific resume data should follow the same structure

### AI Integration Guidelines
- Always validate OpenAI API responses before using
- Provide fallback behavior when AI services are unavailable
- Include proper error handling and user feedback
- Respect rate limits and implement appropriate retry logic

### Performance Considerations
- Optimize for fast initial page load
- Use React Server Components where possible
- Minimize client-side JavaScript bundle size
- Implement proper loading states for AI operations
