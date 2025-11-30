# Halloween House Rater

A simple Next.js 15 app for rating Halloween house decorations and candy.

## Features

- Get your current location using browser geolocation
- Rate houses on decorations (1-10) and candy quality (1-10)
- Simple dark-themed UI with Tailwind CSS
- No database (ratings are logged to console)

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React 19

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. Click "Get My Location" on the home page
2. Allow browser location permissions
3. Click "Rate This Location" once your coordinates appear
4. Use the sliders to rate decorations and candy (1-10)
5. Submit your rating
6. Check the server console to see logged ratings

## Project Structure

```
/app
  /api
    /rate
      route.ts       # API endpoint for submitting ratings
  /rate
    page.tsx         # Rating form page
  layout.tsx         # Root layout with header
  page.tsx           # Home page with geolocation
  globals.css        # Global styles and Tailwind imports
```

## Build for Production

```bash
npm run build
npm start
```
# Trigger redeploy with KV env vars
