# Terra Farm

[![NASA Space Apps Challenge](https://img.shields.io/badge/NASA-Space%20Apps%20Challenge-0B3D91?logo=nasa)](https://www.spaceappschallenge.org/)

Terra Farm is a strategic simulation game developed for the **NASA Space Apps Challenge** where you manage a nation's agricultural policy, balancing food production with environmental sustainability. Choose a country, invest a limited budget across crops, fertilizer, irrigation, and technology, and respond to changing conditions each turn as you aim for a high final score.

## Screenshots

![Terra Farm Gameplay](images/gameplay.png)

## Key Features

- **Country Selection**: Choose from six countries (USA, China, India, Brazil, Egypt, Ireland), each with unique traits and starting conditions across five historical eras.
- **Strategic Investment**: Allocate your budget across crops, fertilizer, irrigation, and advanced technology using intuitive sliders.
- **Turn-Based Progression**: Make investment decisions, then execute a turn to see results simulated — crop yields, revenue, environmental impact, and more.
- **NDVI Map**: A satellite-data-inspired map visualizes vegetation health across your nation, updating each turn.
- **Dynamic Events**: Random events and UN reports occur each turn, forcing you to adapt your strategy.
- **Turn History & Logs**: Investment breakdowns, NDVI averages, environmental scores, and revenue are recorded each turn in a history panel and downloadable as JSON.
- **Scoring**: Final score calculated from total revenue, environmental score, and technology level.
- **Challenge Modes**: Choose from Free Play, Eco Keeper (final environmental score ≥ 80), or Growth Drive (1.8× total revenue). Pass/fail is shown at game over.
- **Frontier Lab**: A dedicated mode set in hotter, drier conditions where you pursue the "Regeneration Loop" challenge (environment ≥ 78, initial NDVI +0.03, resilience ≥ 70).
- **Climate Pulse & Resilience**: Per-turn climate risk, regeneration power, and attention tags displayed as a mission pulse panel and recorded in history and logs.
- **Impact Preview**: Before executing a turn, preview your allocation mix, climate readiness, and policy signals derived from your slider positions.
- **Signal Theme**: A high-contrast, mission-control-inspired theme in addition to standard dark and light modes — highlights climate risk and critical indicators.
- **Trend Charts**: Mini bar + line charts show recent revenue, average NDVI, environmental score, and tech points at a glance.
- **One-Click Allocation Presets**: Apply "Eco Focus", "Profit Focus", or "Tech Focus" ratios instantly. Save your current slider values as a custom preset for later reuse.
- **Competition Mode**: Enter a player name and compete under fixed-seed tournament conditions. Rankings are stored in Cloudflare D1 and surfaced via a leaderboard.
- **i18n Support**: Japanese and English language support (switchable on the start screen).

## Tech Stack

- **Frontend**: Vanilla HTML / CSS / JavaScript (ES6) — no framework dependencies
- **Cloudflare Integration**: `wrangler` for local Pages Functions / D1 development, designed for Cloudflare Pages deployment
- **Libraries**: Zero external runtime dependencies
- **Serving**: Uses `fetch` and `/api/*` routes, so `file://` direct open does not work. Default is `npm run dev` which starts the Cloudflare local environment.

## Setup

```bash
npm install          # First time only
npm run dev          # Applies D1 migrations + starts Pages Functions
```

Open `http://127.0.0.1:8080/` in your browser. `npm run dev` applies local D1 migrations before launching `wrangler pages dev`, so competition mode rankings (fetch and submit) work on the same origin.

### Static-only preview

```bash
npm run dev:static
```

In this mode the ranking API is unavailable — competition mode fetch/submit will fail. Use this for UI-only checks.

### Docker

You can run the app without installing Node locally using Docker and `docker-compose`.

```bash
# Build the image
docker-compose build

# Start (default port 8080; set PORT=8081 etc. to change)
PORT=8080 docker-compose up -d

# Stop
docker-compose down
```

Open `http://localhost:8080/` (or your custom port) to play.

## How to Play

1. Clone the repository and run `npm run dev` to start the local server.
2. Open `http://127.0.0.1:8080/` and choose your **player name**, **play mode**, **display theme**, and **language** on the start screen.
3. In Solo mode, freely configure your **country**, **starting budget**, **mission year**, and **challenge**. Frontier Lab locks the challenge to "Regeneration Loop". Competition mode uses fixed tournament conditions.
4. On the main screen, adjust sliders in the "Policy & Investment" panel. Use presets (Eco / Profit / Tech) or save and apply a custom preset to speed things up.
5. Before executing a turn, check the **Impact Preview** for your allocation mix, climate readiness, and policy signals.
6. Click **Execute Turn** to advance one turn. Results appear in the report, with mission pulse showing climate risk and resilience, and trend charts showing recent revenue, NDVI, environment, and tech points.
7. Scroll to **Turn History** below the report to review recent investment balance, NDVI, revenue, environmental score, and climate risk/resilience. Use **Download Log** to export detailed logs as JSON.
8. When the final turn ends, your total score and challenge result are displayed. In Competition mode, your score is automatically submitted at this point.

## File Structure

```
/
├── index.html              # Main HTML file
├── wrangler.jsonc          # Cloudflare Pages / D1 configuration
├── _headers                # Cloudflare Pages security headers (CSP, HSTS)
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker Compose configuration
├── css/
│   └── style.css           # Stylesheet
├── functions/
│   ├── api/                # Pages Functions API routes
│   │   ├── competition     # Competition mode endpoints
│   │   └── leaderboard.js  # Leaderboard endpoint
│   └── _lib/               # Shared API helpers
├── js/
│   ├── main.js             # Entry point and initialization
│   ├── config.js           # Game constants (crop data, event definitions)
│   ├── state.js            # Game state management (budget, score, settings)
│   ├── ui.js               # UI updates and event handling
│   ├── game-logic.js       # Core game logic (turn processing, scoring)
│   ├── map.js              # NDVI map rendering
│   ├── competition.js      # Competition mode, seeded RNG, ranking integration
│   └── i18n.js             # Internationalization (Japanese / English)
├── migrations/
│   └── 0001_competition_mode.sql  # D1 schema and initial tournament data
├── data/
│   └── maps/               # Per-country, per-era NDVI map data (JSON)
└── images/
    ├── earth.jpg           # Background image
    ├── nasa_logo.png       # NASA logo for UI
    └── gameplay.png        # Gameplay screenshot
```

## Deployment (Cloudflare Pages)

- `npm run dev` uses `wrangler pages dev` locally, so API routes under `/api/*` work identically to production Pages Functions.
- Competition mode rankings rely on the D1 binding `DB`.
- Deployment requires uploading with Functions included (not static-only assets).

## Credits & Attribution

- **NASA Space Apps Challenge**: This project was created as part of the [NASA Space Apps Challenge](https://www.spaceappschallenge.org/). The NASA logo and branding are used under the challenge guidelines for project presentation purposes.
- **Satellite Imagery**: Background image and map visualizations are inspired by NASA Earth observations. NDVI (Normalized Difference Vegetation Index) data concepts are derived from NASA MODIS (MOD13A3).
- **Icons & Assets**: Country flag emojis are standard Unicode emoji provided by the operating system.

## Security Disclaimer

### Competition Mode

The competition mode leaderboard is implemented **for demonstration and casual play only**. Key limitations:

- **No authentication**: Anyone can submit scores under any player name.
- **Client-side trust**: Game results are computed in the browser and sent to the server without server-side revalidation. A motivated user could tamper with their submitted score.
- **Best-effort rate limiting**: Rate limiting relies on in-memory state that does not persist across Cloudflare Workers instances.

These are intentional trade-offs for a hackathon project. **Do not rely on this implementation for production or competitive integrity.** If deploying competitively, add server-side game simulation, authentication, and WAF-based rate limiting.

### General

- This application uses `localStorage` to store your player name, anonymous player ID, and theme preference. No personal data is transmitted to third parties.
- API endpoints are unauthenticated — do not expose sensitive data through them.

## License

MIT
