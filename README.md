# Workouts

Workouts is a mobile-first, offline-first workout tracker built as an installable PWA. It is designed for quick strength-training logs on a phone: create reusable workout templates, start a session, record weight and reps, and reference what you lifted last time without needing an account or backend.

## Features

- Create and edit reusable workout templates
- Start workout sessions from templates
- Log weight, reps, and notes for each set
- View previous-session hints while logging
- Auto-save workout edits locally
- Edit or delete completed workouts
- Export and import local backups as JSON
- Install to a phone home screen as a PWA
- Works offline using IndexedDB and a service worker

## Tech Stack

- React
- TypeScript
- Vite
- Dexie / IndexedDB
- CSS Modules
- vite-plugin-pwa
- Vitest
- oxlint
- GitHub Actions
- GitHub Pages

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run tests:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

## Deployment

The app is configured for GitHub Pages with a Vite base path of `/Workout-Tracker/`.

Deployment is handled by GitHub Actions in `.github/workflows/deploy.yml`. On every push to `main`, the workflow:

1. Installs dependencies with `npm ci`
2. Builds the app with `npm run build`
3. Uploads the `dist/` folder
4. Publishes the site to GitHub Pages

## Project Notes

This app intentionally keeps the product simple:

- No backend
- No accounts
- No sync
- No charts or social features
- Data stays on the user's device unless exported manually

The design direction is a calm, dark, phone-first logging interface optimized for fast use between sets.
