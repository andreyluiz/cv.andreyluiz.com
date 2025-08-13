# Design Document

## Overview

This design outlines the migration from OpenAI to OpenRouter integration, enabling users to select from multiple AI models while maintaining the existing functionality. The solution leverages OpenRouter's OpenAI-compatible API, requiring minimal changes to the existing codebase while adding model selection capabilities.

## Architecture

### High-Level Changes

The integration will modify three main areas:

1. **State Management**: Extend the Zustand store to include model selection
2. **UI Components**: Update the API key modal to include OpenRouter branding and model selection
3. **API Integration**: Modify the OpenAI client configuration to use OpenRouter's endpoint

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ApiKeyModal (Updated)                    │
│  ┌─────────────────┐  ┌─────────────────────────────────┐   │
│  │  API Key Input  │  │     Model Selector Dropdown    │   │
│  │  (OpenRouter)   │  │   (6 predefined models)        │   │
│  └─────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Zustand Store (Extended)                 │
│  • apiKey: string                                          │
│  • selectedModel: string                                   │
│  • setApiKey(key: string)                                  │
│  • setSelectedModel(model: string)                         │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                OpenRouter Client (Modified)                 │
│  • Base URL: https://openrouter.ai/api/v1                  │
│  • Headers: HTTP-Referer, X-Title                          │
│  • Model: User-selected model                              │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Updated Store Interface

```typescript
interface StoreState {
  apiKey: string;
  selectedModel: string;
  setApiKey: (apiKey: string) => void;
  setSelectedModel: (model: string) => void;
}
```

### 2. Model Configuration

```typescript
interface ModelOption {
  id: string;
  name: string;
  provider: string;
  isFree: boolean;
}

const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "openai/gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "OpenAI",
    isFree: false,
  },
  {
    id: "openai/gpt-oss-120b",
    name: "GPT OSS 120B",
    provider: "OpenAI",
    isFree: false,
  },
  {
    id: "openai/gpt-oss-20b:free",
    name: "GPT OSS 20B (Free)",
    provider: "OpenAI",
    isFree: true,
  },
  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash (Free)",
    provider: "Google",
    isFree: true,
  },
  { id: "qwen/qwq-32b", name: "QwQ 32B", provider: "Qwen", isFree: false },
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek Chat V3 (Free)",
    provider: "DeepSeek",
    isFree: true,
  },
];
```

### 3. OpenRouter Client Configuration

```typescript
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "CV Tailor App",
  },
});
```

## Data Models

### Store State Extension

The existing Zustand store will be extended to include:

- `selectedModel`: String representing the selected model ID
- `setSelectedModel`: Function to update the selected model

### Model Selection Data

Models will be defined as a constant array with metadata including:

- Model ID (as used by OpenRouter)
- Display name for the UI
- Provider information
- Free tier availability

## Error Handling

### API Error Scenarios

1. **Invalid API Key**: Display clear message about OpenRouter key requirements
2. **Model Unavailable**: Suggest alternative models from the available list
3. **Rate Limiting**: Provide information about OpenRouter rate limits
4. **Network Errors**: Standard retry mechanisms with OpenRouter-specific messaging

### Error Message Updates

All error messages will be updated to reference OpenRouter instead of OpenAI, with specific guidance for:

- API key format and acquisition
- Model-specific limitations
- OpenRouter account setup

## Testing Strategy

### Unit Tests

1. **Store Tests**: Verify model selection persistence and state management
2. **Component Tests**: Test modal UI with model dropdown functionality
3. **API Client Tests**: Mock OpenRouter responses and test error handling

### Integration Tests

1. **End-to-End Flow**: Test complete user journey from model selection to AI response
2. **Migration Tests**: Verify smooth transition from existing OpenAI setup
3. **Error Scenarios**: Test various failure modes and error messages

### Manual Testing Checklist

- [ ] API key input accepts OpenRouter keys
- [ ] Model dropdown displays all 6 options correctly
- [ ] Selected model persists across browser sessions
- [ ] Resume tailoring works with each model
- [ ] Cover letter generation works with each model
- [ ] Error messages are clear and helpful
- [ ] UI maintains consistent styling and responsiveness

## Implementation Considerations

### Migration Strategy

1. **Backward Compatibility**: Existing users with OpenAI keys will see a migration prompt
2. **Default Model**: New users will default to `openai/gpt-4.1-mini`
3. **Gradual Rollout**: Feature can be enabled via environment variable if needed

### Performance Impact

- Minimal performance impact as OpenRouter uses the same OpenAI SDK
- Model selection adds negligible overhead to API calls
- Local storage usage increases slightly for model preference

### Security Considerations

- API keys remain stored locally in browser storage
- OpenRouter requires HTTP-Referer header for security
- No additional sensitive data is transmitted or stored

### Accessibility

- Model dropdown will be fully keyboard navigable
- Screen reader support for model selection
- Clear labeling for all form elements
- Maintain existing accessibility standards
