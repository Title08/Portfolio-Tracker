# Portfolio Tracker

A modern, high-fidelity portfolio tracking application built with React, Tailwind CSS, and a Python FastAPI backend.

## Features

-   **AI Analysis**: Comprehensive portfolio analysis using Groq/AI with selectable strategies (Defensive, Growth, Balanced, etc.).
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
-   **Backend**: Python, FastAPI, yfinance (Yahoo Finance API), Groq (AI).
-   **Containerization**: Docker & Docker Compose.

## Project Structure

```
├── api/                 # Python FastAPI Backend
│   ├── app/             # Application Package
│   │   ├── models.py    # Pydantic Schemas
│   │   ├── routers/     # API Endpoints (Assets, Analysis)
│   │   └── services/    # Business Logic (Finance, AI)
│   ├── main.py          # App Entry Point
│   └── Dockerfile       # Backend Docker Config
├── src/                 # React Frontend
│   ├── components/      # UI Components
│   ├── hooks/           # Custom Hooks (Logic)
│   ├── services/        # API Services
│   ├── utils/           # Helper functions
│   └── App.jsx          # Main Application Component
├── docker-compose.yml   # Docker Orchestration
└── .env                 # Environment Variables (Ignored by Git)
```

## Getting Started

### Prerequisites

-   Get a free API Key from [Groq Cloud](https://console.groq.com/).

### Option 1: Docker (Recommended)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Title08/Portfolio-Tracker.git
    cd Portfolio-Tracker
    ```

2.  **Configure Environment**:
    Create a `.env` file in the root directory:
    ```bash
    GROQ_API_KEY=your_groq_api_key_here
    ```

3.  **Run with Docker Compose**:
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

1.  **Backend Setup**:
    ```bash
    # Create virtual environment
    python -m venv .venv
    
    # Activate script (Windows: .\.venv\Scripts\Activate, Mac/Linux: source .venv/bin/activate)
    # Install dependencies
    pip install -r api/requirements.txt
    
    # Set Environment Variable (or use .env with python-dotenv)
    export GROQ_API_KEY=your_key  # (Linux/Mac)
    set GROQ_API_KEY=your_key     # (Windows CMD)
    
    # Run API
    python api/main.py --reload
    ```

## Troubleshooting

-   **Hot Reload on Windows**: If hot reload isn't working in Docker, ensure `vite.config.js` has polling enabled (`usePolling: true`).
-   **API Errors**: specific "Search Error" or "Info Error" usually means `yfinance` failed to fetch data from Yahoo. Check your internet connection.

## License

MIT

