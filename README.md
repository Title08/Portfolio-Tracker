# Portfolio Tracker

A modern, high-fidelity portfolio tracking application built with React, Tailwind CSS, and a Python FastAPI backend.

## Features

-   **Smart Autocomplete**: Instantly recognizes 500+ stocks (S&P 500, Nasdaq 100, Dow Jones) and autofills details.
-   **Indices & ETFs**: Track major market indices (`^GSPC`, `^NDX`, `^DJI`) and their ETFs directly.
-   **Asset Tracking**: Track Stocks, Crypto, and Cash (USD/THB).
-   **Real-time Prices**: Live price updates via Yahoo Finance.
-   **Persistence**: Remembers your preferred external exchange rates automatically.
-   **Sector & Industry**: Automatic tagging of assets for better diversification visibility.
-   **Multi-Currency**: Seamlessly handle USD investments and THB local currency.
-   **Exchange**: Simulate currency exchanges between wallets.
-   **Sync & Backup**: Manual Import/Export of portfolio data (JSON) for cross-device usage.
-   **Visualizations**: Clean, responsive UI with dark mode aesthetics.
-   **Dashboard Statistics**: Comprehensive overview of Net Worth, Total Cost, and PnL.

## Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, Lucide React (Icons).
-   **Backend**: Python, FastAPI, yfinance (Yahoo Finance API).
-   **Containerization**: Docker & Docker Compose.

## Project Structure

```
├── api/                 # Python FastAPI Backend
│   ├── main.py          # API Endpoints
│   └── Dockerfile       # Backend Docker Config
├── src/                 # React Frontend
│   ├── components/      # UI Components
│   ├── hooks/           # Custom Hooks (Logic)
│   ├── services/        # API Services
│   ├── utils/           # Helper functions
│   └── App.jsx          # Main Application Component
└── docker-compose.yml   # Docker Orchestration
```

## Getting Started

### Option 1: Docker (Recommended)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/portfolio-tracker.git
    cd portfolio-tracker
    ```

2.  **Run with Docker Compose**:
    ```bash
    docker-compose up --build
    ```
    - Frontend: `http://localhost:5173`
    - Backend: `http://localhost:8000`

### Option 2: Manual Setup

#### Prerequisites
- Node.js (v16+)
- Python (v3.9+)

#### Installation

1.  **Frontend Setup**:
    ```bash
    npm install
    npm run dev
    ```

2.  **Backend Setup**:
    ```bash
    # Create virtual environment
    python -m venv .venv
    
    # Activate script (Windows: .\.venv\Scripts\Activate, Mac/Linux: source .venv/bin/activate)
    # Install dependencies
    pip install -r api/requirements.txt
    
    # Run API
    python api/main.py --reload
    ```

## Troubleshooting

-   **Hot Reload on Windows**: If hot reload isn't working in Docker, ensure `vite.config.js` has polling enabled (`usePolling: true`).
-   **API Errors**: specific "Search Error" or "Info Error" usually means `yfinance` failed to fetch data from Yahoo. Check your internet connection.

## License

MIT

