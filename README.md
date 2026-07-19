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
- GitHub Pages-compatible static deployment

## Data Sources

The dashboard retrieves market information from public and free-tier APIs for precious metals, Bitcoin, and SPY as an S&P 500 proxy. Availability and rate limits depend on each provider.

The displayed information is for educational purposes and may differ from exchange or dealer prices.

## Run Locally

Clone the repository:

```bash
git clone https://github.com/jiholee5217/bullion-tracker.git
cd bullion-tracker
```

Start a local web server:

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

Opening `index.html` directly with a `file://` URL may prevent some API requests because of browser cross-origin restrictions.

## Project Structure

```text
bullion-tracker/
└── index.html
```

The application is currently implemented as a single-file React prototype containing its components, styling, and API integration logic.

## Security Note

Do not commit production API keys or other credentials to a public repository. For a production version, move authenticated API requests behind a backend service or serverless function and keep secrets in environment variables.

## Disclaimer

This project is for educational and informational purposes only. It does not provide financial advice.
  
