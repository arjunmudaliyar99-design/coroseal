# Gemini assistant setup

The browser must not receive the Gemini key. Keep `GEMINI_API_KEY` in the server environment only. Do not use a `VITE_` prefix because Vite exposes those variables to client code.

1. Copy `.env.example` to `.env` and set `GEMINI_API_KEY`.
2. For local development, start both the Vite app and Gemini proxy with one command:

```powershell
npm run dev
```

3. For a production deployment, build and start the unified server:

```powershell
npm run build
npm start
```

The server uses the hosting platform's `PORT` when provided, otherwise it uses `GEMINI_PROXY_PORT` locally.

The proxy accepts `POST /api/chat` with `{ "messages": [{ "role": "user", "content": "..." }] }` and returns `{ "reply": "..." }`. The current UI keeps a local assistant fallback so the website remains useful when Gemini is not configured.

For production, configure `GEMINI_API_KEY` in the hosting provider's environment settings. Never commit `.env` or the key. The production server serves the Vite build and the protected `/api/chat` endpoint from the same origin.

## Vercel deployment

This repository includes `api/chat.js` for Vercel Functions and `vercel.json` for the single-page app fallback. Import the GitHub repository into Vercel, select the Vite framework preset, use `npm run build` as the build command, and use `dist` as the output directory. Add `GEMINI_API_KEY` and optionally `GEMINI_MODEL` under Vercel Environment Variables for Preview and Production. Do not upload `.env`; rotate any key that has been exposed and store only the replacement in Vercel.
