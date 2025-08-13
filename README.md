# AI-Powered CV Tailor

This project is a highly customizable, AI-powered CV tailor that helps you adapt your resume to specific job descriptions. It's built with Next.js, Tailwind CSS, and OpenAI, and it's designed to be easily forked and adapted to your own needs.

## Features

- **AI-Powered Resume Tailoring:** Automatically tailors your resume to specific job descriptions using the OpenAI API.
- **Cover Letter Generation:** Generates a cover letter based on your resume and the job description.
- **Multi-language Support:** Supports multiple languages, with English, French, and Portuguese included by default.
- **Light and Dark Themes:** Includes a theme switcher for light and dark modes.
- **Print-friendly:** The resume is designed to be easily printed.
- **Easy to Customize:** The project is designed to be easily forked and adapted to your own needs.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [Bun](https://bun.sh/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/cv.andreyluiz.com.git
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Set up environment variables:**

   Copy the example environment file and update it with your configuration:

   ```bash
   cp .env.example .env.local
   ```

   Update the `NEXT_PUBLIC_SITE_URL` in `.env.local` if needed. For development, the default `http://localhost:3000` should work fine.

4. **Run the development server:**

   ```bash
   bun run dev
   ```

## Environment Variables

The application uses the following environment variables:

- `NEXT_PUBLIC_SITE_URL`: The URL of your site, used for OpenRouter HTTP-Referer header. Defaults to `http://localhost:3000` for development.

For production deployment, make sure to set `NEXT_PUBLIC_SITE_URL` to your actual domain (e.g., `https://yourdomain.com`).

## Customization

### Resume Data

The resume data is stored in JSON files in the `src/lib/server` directory. You can update these files with your own information.

- `resume-en.json`: English version of the resume.
- `resume-fr.json`: French version of the resume.
- `resume-pt.json`: Portuguese version of the resume.

### Languages

The project uses `next-intl` for internationalization. You can add new languages by creating a new JSON file in the `messages` directory and updating the `src/i18n/routing.ts` file.

### Theme

The project uses Tailwind v4 for styling. You can customize the theme by updating the `src/app/globals.css` file.

## Project Structure

```
.
├── .next
├── messages
│   ├── en.json
│   ├── fr.json
│   └── pt.json
├── public
│   └── profile.png
├── src
│   ├── app
│   │   ├── [locale]
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── favicon.ico
│   │   └── globals.css
│   ├── i18n
│   │   ├── navigation.ts
│   │   ├── request.ts
│   │   └── routing.ts
│   ├── lib
│   │   ├── components
│   │   │   ├── modals
│   │   │   ├── providers
│   │   │   ├── resume
│   │   │   └── ui
│   │   ├── server
│   │   │   ├── actions.ts
│   │   │   ├── openai.ts
│   │   │   ├── resume-en.json
│   │   │   ├── resume-fr.json
│   │   │   └── resume-pt.json
│   │   ├── api.ts
│   │   ├── lang.ts
│   │   ├── store.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   └── middleware.ts
├── .gitignore
├── biome.json
├── bun.lock
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

- **`messages`**: Contains the JSON files for internationalization.
- **`public`**: Contains the public assets, such as the profile picture.
- **`src/app`**: Contains the main application code, including the layout and pages.
- **`src/i18n`**: Contains the configuration for `next-intl`.
- **`src/lib/components`**: Contains the React components.
- **`src/lib/server`**: Contains the server-side code, including the OpenAI API integration and the resume data.
- **`src/lib/store.ts`**: Contains the Zustand store for client-side state management.

## Deployment

You can deploy the project to any hosting provider that supports Next.js, such as Vercel or Netlify.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have any ideas or suggestions.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
