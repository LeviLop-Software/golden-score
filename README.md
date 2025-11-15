This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Internationalization (i18n)

This project is configured with Hebrew (עברית) as the default language with RTL support.

### Using Translations

In your components, use the `useTranslation` hook:

```tsx
'use client';

import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('welcome')}</h1>;
}
```

### Adding English or Other Languages

1. Create a new translation file: `src/locales/en/translation.json`
2. Add the same keys with English values:
   ```json
   {
     "search": "Search",
     "exportPdf": "Export to PDF",
     "score": "Score"
   }
   ```
3. Import and register the language in `src/i18n.tsx`:
   ```tsx
   import enTranslation from './locales/en/translation.json';
   
   resources: {
     he: { translation: heTranslation },
     en: { translation: enTranslation },
   }
   ```
4. To switch languages, use: `i18n.changeLanguage('en')`

### Available Translation Keys

See `src/locales/he/translation.json` for all available translation keys.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
