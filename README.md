# To Do List App

Simple mobile-first list and task manager built with React, TypeScript, and Tailwind CSS. The app is installable as a PWA and keeps list/task data in `localStorage`.

## Setup

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Installable PWA

- On Android Chrome or Samsung Internet, open the deployed site and use `Install app`.
- On iPhone Safari, use `Share` -> `Add to Home Screen`.
- The app works offline after the first successful load of the app shell.

## Deploy to Vercel

```bash
npm install
npm run build
```

Then either:

1. Import the project into Vercel from GitHub and deploy with:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
2. Or deploy from the CLI:

```bash
npm i -g vercel
vercel
```

## Notes

- Data is stored in `localStorage` under `reminders-lite-data`.
- Completed tasks are removed from the UI immediately after a short fade-out and can be restored from the undo toast for 4 seconds.
