# Coroseal React Handover

## Current state

- React/Vite app lives in `src/main.jsx` and `src/styles.css`.
- Run the frontend with `npm run dev`.
- Production build passes with `npm run build`.
- Local assets are under `public/`:
  - `public/carousel/1.jpg` through `4.jpg`
  - `public/carousel/services_01.jpg` and `services_02.jpg`
  - `public/about/why_icon_01.png` through `why_icon_06.png`
  - `public/clients/client_01.jpg` through `client_10.jpg`
  - `public/downloads/Coroseal-PPT.pdf`

## Routes

- `/` homepage
- `/about-us.html` redesigned About page with history, mission, vision, strengths, team, and clients
- `/services.html` service parity page with engineering/field-service sections and service photos
- `/projects.html` intentional Coming Soon page
- `/download.html` local brochure download and product library
- `/contact-us.html` contact/enquiry page
- `/products/*.html` product detail views handled by the React app

## Assistant

`src/IndustryAssistant.jsx` is the active site-wide assistant. It has:

- Quick prompts for chemical tanks, fume control, and FRP piping
- Conversation history in the current browser session
- Local fallback answers when Gemini is unavailable
- A direct Contact Sales action
- Optional Gemini responses through `/api/chat`

The older inline assistant remains in `src/main.jsx` as `LegacyIndustryAssistant`; it is not rendered by `App` and can be removed during cleanup.

## Gemini setup

Never put a Gemini key in React or any `VITE_*` variable. Use the server-only proxy:

```powershell
Copy-Item .env.example .env
# edit .env and set GEMINI_API_KEY
npm run api
```

Run Vite in a second terminal:

```powershell
npm run dev
```

Full details are in `GEMINI_SETUP.md`. The proxy is `server/gemini.mjs` and Vite forwards `/api` to port `8787`.

## Design direction

- Industrial editorial look: deep blue, orange accent, pale green-gray surfaces
- Responsive mobile-first layouts
- Animated reveal, hover, floating hero media, assistant typing state
- `prefers-reduced-motion` support

## Next useful enhancements

- Remove the unused `LegacyIndustryAssistant` function.
- Add real team headshots if supplied; currently team uses clean initials because the legacy site only exposes one generic `nophoto.jpg`.
- Add the remaining five client logo assets if needed.
- Add analytics and a real form backend before production launch.
- Add server-side rate limiting and request logging to the Gemini proxy.
