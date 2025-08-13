# Requirements Document

## Introduction

This feature will replace the current OpenAI API key configuration with OpenRouter integration, allowing users to select from multiple AI models while maintaining the same functionality for resume tailoring and cover letter generation. OpenRouter provides access to various AI models through a unified API that's compatible with the OpenAI SDK, making the transition seamless while offering users more model choices and potentially better pricing options.

## Requirements

### Requirement 1

**User Story:** As a user, I want to configure an OpenRouter API key instead of an OpenAI key, so that I can access multiple AI models through a single provider.

#### Acceptance Criteria

1. WHEN the user clicks the API configuration button THEN the system SHALL display "OpenRouter API Key" instead of "OpenAI API Key"
2. WHEN the user enters an OpenRouter API key THEN the system SHALL validate and store the key securely
3. WHEN the user saves the OpenRouter API key THEN the system SHALL persist it in local storage for future sessions
4. IF the user has an existing OpenAI key stored THEN the system SHALL migrate or prompt for the new OpenRouter key

### Requirement 2

**User Story:** As a user, I want to select from a list of available AI models, so that I can choose the best model for my resume tailoring needs based on performance, cost, or availability.

#### Acceptance Criteria

1. WHEN the user opens the API configuration modal THEN the system SHALL display a dropdown list of available models
2. WHEN the user views the model list THEN the system SHALL show the following options:
   - openai/gpt-4.1-mini
   - openai/gpt-oss-120b
   - openai/gpt-oss-20b:free
   - google/gemini-2.0-flash-exp:free
   - qwen/qwq-32b
   - deepseek/deepseek-chat-v3-0324:free
3. WHEN the user selects a model THEN the system SHALL save the selection and use it for all AI operations
4. WHEN no model is selected THEN the system SHALL default to a reasonable option (openai/gpt-4.1-mini)
5. WHEN the user changes the selected model THEN the system SHALL immediately apply the change to future AI requests

### Requirement 3

**User Story:** As a user, I want all AI-powered features to use my selected OpenRouter model, so that I get consistent results from my chosen AI provider.

#### Acceptance Criteria

1. WHEN the user triggers resume tailoring THEN the system SHALL use the selected OpenRouter model and API key
2. WHEN the user generates a cover letter THEN the system SHALL use the selected OpenRouter model and API key
3. WHEN making API calls to OpenRouter THEN the system SHALL use the OpenAI SDK with OpenRouter's base URL
4. IF the API call fails due to model unavailability THEN the system SHALL display a clear error message suggesting model alternatives
5. WHEN the system makes API requests THEN the system SHALL include the proper OpenRouter headers and authentication

### Requirement 4

**User Story:** As a user, I want the transition from OpenAI to OpenRouter to be seamless, so that I don't lose any existing functionality or experience disruption.

#### Acceptance Criteria

1. WHEN the user accesses resume tailoring features THEN the system SHALL maintain the same user interface and workflow
2. WHEN the user generates content THEN the system SHALL produce results of similar or better quality compared to the previous OpenAI integration
3. WHEN the system encounters errors THEN the system SHALL provide helpful error messages specific to OpenRouter and model selection
4. IF the user has no API key configured THEN the system SHALL prompt for OpenRouter configuration instead of OpenAI
5. WHEN the user interacts with AI features THEN the system SHALL maintain the same response times and user experience as before
