# Portfolio Tracker

A modern, high-fidelity portfolio tracking application built with React, Tailwind CSS, and a Python FastAPI backend.

## Features

### Core
-   **Asset Tracking**: Track Stocks, Crypto, and Cash (USD/THB).
-   **Real-time Prices**: Live price updates (15s interval) via Yahoo Finance with daily percentage change.
-   **Smart Autocomplete**: Instantly recognizes 500+ stocks (S&P 500, Nasdaq 100, Dow Jones) and autofills details.
-   **Economic Calendar**: Real-time economic events from ForexFactory with currency filtering and impact levels.
-   **Indices & ETFs**: Track major market indices (`^GSPC`, `^NDX`, `^DJI`) and their ETFs directly.
-   **Sector & Industry**: Automatic tagging of assets for better diversification visibility.
-   **Multi-Currency**: Seamlessly handle USD investments and THB local currency.
-   **Exchange**: Simulate currency exchanges between wallets.
-   **Sync & Backup**: Manual Import/Export of portfolio data (JSON) for cross-device usage.
-   **Visualizations**: Clean, responsive UI with Line Charts (Performance), Pie Charts (Allocation), and dark mode.
-   **Dashboard Statistics**: Comprehensive overview of Net Worth, Total Cost, PnL, and Daily Change.
-   **Persistence**: Remembers your preferred external exchange rates automatically.

### AI Features
-   **Portfolio Analysis**: Comprehensive portfolio analysis using Groq AI with selectable strategies (Defensive, Growth, Balanced, etc.).
-   **News Feed**: Real-time financial news from Yahoo Finance.
-   **AI News Summary**: Summarize market news with a single click.
-   **AI Model Selection**: Choose from 13 Groq models (Llama, Qwen, GPT OSS, Mixtral, Gemma, DeepSeek).
-   **Bilingual AI**: Toggle AI output language between English 🇺🇸 and Thai 🇹🇭.

## Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, Lucide React (Icons), React Markdown.
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
│   │   ├── modals/      # Modal components (Settings, AI Analysis, etc.)
│   │   └── layout/      # Layout components (Navbar, etc.)
│   ├── hooks/           # Custom Hooks (Logic)
│   ├── pages/           # Page components (Dashboard, News)
│   ├── services/        # API Services
│   ├── utils/           # Helper functions
│   └── App.jsx          # Main Application Component
├── docker-compose.yml   # Docker Orchestration
├── .eslintrc.cjs        # ESLint Configuration
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

2.  **Frontend Setup**:
    ```bash
    npm install
    npm run dev
    ```

## AI Models Available

The following Groq models are available for AI features:

| Category | Models |
|----------|--------|
| Qwen | Qwen 3 32B |
| Meta Llama | Llama 3.3 70B, Llama 3.1 8B, Llama 3 70B, Llama 3 8B |
| OpenAI OSS | GPT OSS 120B, GPT OSS 20B |
| Mistral | Mixtral 8x7B |
| Google | Gemma 7B IT, Gemma 2 9B IT |
| DeepSeek | DeepSeek R1 Distill 70B |
| Moonshot | Kimi K2 Instruct |
| Groq | Groq Compound (Multi-tool) |

## Troubleshooting

-   **Hot Reload on Windows**: If hot reload isn't working in Docker, ensure `vite.config.js` has polling enabled (`usePolling: true`).
-   **API Errors**: Specific "Search Error" or "Info Error" usually means `yfinance` failed to fetch data from Yahoo. Check your internet connection.
-   **AI Analysis Fails**: Ensure your `GROQ_API_KEY` is valid and has sufficient quota.

## License

MIT
