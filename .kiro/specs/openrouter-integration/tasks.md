# Implementation Plan

- [x] 1. Update store to support model selection
  - Extend the Zustand store interface to include selectedModel state and setSelectedModel action
  - Add default model selection (openai/gpt-4.1-mini) for new users
  - Ensure model selection persists across browser sessions
  - _Requirements: 2.4, 2.5_

- [x] 2. Create model configuration constants
  - Define AVAILABLE_MODELS array with all 6 required models and their metadata
  - Include model IDs, display names, providers, and free tier information
  - Create TypeScript interfaces for model data structure
  - _Requirements: 2.2_

- [x] 3. Update ApiKeyModal component for OpenRouter integration
  - Change modal title from "OpenAI API Key" to "OpenRouter API Key"
  - Update placeholder text and labels to reference OpenRouter
  - Add model selection dropdown with all available models
  - Update privacy notice to mention OpenRouter instead of OpenAI
  - _Requirements: 1.1, 1.2, 2.1, 2.3_

- [x] 4. Modify OpenAI client configuration for OpenRouter
  - Update openai.ts to use OpenRouter base URL (https://openrouter.ai/api/v1)
  - Add required OpenRouter headers (HTTP-Referer, X-Title)
  - Accept selectedModel parameter in tailorResume and generateCoverLetter functions
  - Replace hardcoded model with dynamic model selection
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 5. Update server actions to pass model selection
  - Modify tailorResume and generateCoverLetter server actions to accept selectedModel parameter
  - Pass selectedModel from client state to OpenAI client functions
  - Ensure backward compatibility during transition
  - _Requirements: 3.1, 3.2_

- [x] 6. Update error handling for OpenRouter-specific scenarios
  - Modify error messages to reference OpenRouter instead of OpenAI
  - Add specific error handling for model unavailability
  - Include helpful suggestions for alternative models in error messages
  - Update error messages in both server actions and client components
  - _Requirements: 3.4, 4.3_

- [x] 7. Create unit tests for new functionality
  - Write tests for store model selection functionality
  - Test ApiKeyModal component with model dropdown
  - Test OpenRouter client configuration and API calls
  - Mock OpenRouter responses for testing
  - _Requirements: 4.2_

- [x] 8. Update existing components to use selected model
  - Modify ResumeTailor component to pass selected model to server actions
  - Update CoverLetterModal to use selected model for generation
  - Ensure all AI-powered features use the selected model consistently
  - _Requirements: 3.1, 3.2_

- [x] 9. Add environment variable for site URL
  - Add NEXT_PUBLIC_SITE_URL environment variable for OpenRouter HTTP-Referer header
  - Update OpenRouter client configuration to use environment variable
  - Provide fallback to localhost for development
  - _Requirements: 3.5_

- [x] 10. Integration testing and validation
  - Test complete user flow from model selection to AI response generation
  - Verify model selection persistence across browser sessions
  - Test error scenarios with invalid API keys and unavailable models
  - Validate that all 6 models work correctly with both resume tailoring and cover letter generation
  - _Requirements: 4.1, 4.4, 4.5_