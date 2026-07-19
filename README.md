# Bullion Tracker

A responsive market dashboard for monitoring gold, silver, Bitcoin, and the S&P 500 in one place.

## Features

- Live price cards with 24-hour price and percentage changes
- Automatic refresh every 90 seconds
- Performance comparison across all tracked assets
- Gold-to-silver and cross-asset ratio analysis
- Interactive historical price charts with multiple time ranges
- Loading, refresh, and API error states
- Responsive layout for desktop and mobile screens

## Technology Stack

- React 18
- JavaScript
- HTML and CSS
- Inline SVG data visualizations
- Babel Standalone
- Node.js serverless functions
- Vercel-compatible deployment

## Data Sources

The dashboard retrieves market information from public and free-tier APIs for precious metals, Bitcoin, and SPY as an S&P 500 proxy. Authenticated requests run through serverless API routes so API keys are never sent to the browser. Availability and rate limits depend on each provider.

The displayed information is for educational purposes and may differ from exchange or dealer prices.

## Run Locally

Clone the repository:

```bash
git clone https://github.com/jiholee5217/bullion-tracker.git
cd bullion-tracker
```

Copy the environment variable template:

```bash
cp .env.example .env.local
```

Add your provider keys to `.env.local`, then start the frontend and serverless functions together:

```bash
npx vercel dev
```

Then open the local URL printed by Vercel.

For static fallback mode, you can instead run:

```bash
python3 -m http.server 8080
```

Gold, silver, and Bitcoin can still use public providers in static mode. Live and historical S&P 500 data requires the backend.

Opening `index.html` directly with a `file://` URL may prevent some API requests because of browser cross-origin restrictions.

## Project Structure

```text
bullion-tracker/
├── api/
│   ├── history.js
│   └── market.js
├── server/
│   └── providers.js
├── .env.example
├── .gitignore
├── index.html
└── README.md
```

The React dashboard remains in `index.html`. The serverless routes validate requests, call authenticated providers, normalize their responses, and return only the market data needed by the browser.

## Environment Variables

```text
FINNHUB_KEY
METALS_DEV_KEY
GOLDAPI_IO_KEY
```

The metal route tries GoldAPI.io first, then Metals.dev, and finally the public Gold-API.com fallback. Finnhub provides the SPY quote and historical data.

## Deploy to Vercel

1. Import this GitHub repository into Vercel.
2. Add the three environment variables under **Project Settings → Environment Variables**.
3. Deploy the project.
4. Use the Vercel URL as the full application URL so `/api/market` and `/api/history` run on the same origin as the frontend.

## Security Note

Do not commit `.env.local`, production API keys, or other credentials. The repository includes only empty variable names in `.env.example`; real values belong in local or deployment environment settings.

## Disclaimer

This project is for educational and informational purposes only. It does not provide financial advice.
  
