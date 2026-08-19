# Gemini assistant setup

The browser must not receive the Gemini key. Keep `GEMINI_API_KEY` in the server environment only. Do not use a `VITE_` prefix because Vite exposes those variables to client code.

1. Copy `.env.example` to `.env` and set `GEMINI_API_KEY`.
2. Start the proxy in a second terminal:

```powershell
node server/gemini.mjs
```

3. Keep the Vite app running in the first terminal:

```powershell
npm run dev
```

The proxy accepts `POST /api/chat` with `{ "messages": [{ "role": "user", "content": "..." }] }` and returns `{ "reply": "..." }`. The current UI keeps a local assistant fallback so the website remains useful when Gemini is not configured.

For production, deploy `server/gemini.mjs` as a protected server/serverless function and configure the secret in the hosting provider's environment settings. Never commit `.env` or the key.
