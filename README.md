# Portfolio Tracker

A modern, high-fidelity portfolio tracking application built with React, Tailwind CSS, and a Python FastAPI backend.

![Portfolio Screenshot](path/to/screenshot.png)

## Features

-   **Asset Tracking**: Track Stocks, Crypto, and Cash (USD/THB).
-   **Real-time Prices**: Live price updates via Yahoo Finance.
-   **Sector & Industry**: Automatic tagging of assets for better diversification visibility.
-   **Multi-Currency**: Seamlessly handle USD investments and THB local currency.
-   **Exchange**: Simulate currency exchanges between wallets.
-   **Visualizations**: Clean, responsive UI with dark mode aesthetics.

## Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, Lucide React (Icons).
-   **Backend**: Python, FastAPI, yfinance (Yahoo Finance API).
-   **Deployment**: Ready for Docker (optional).

## Getting Started

### Prerequisites

-   Node.js (v16+)
-   Python (v3.9+)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/portfolio-tracker.git
    cd portfolio-tracker
    ```

2.  **Frontend Setup:**
    ```bash
    npm install
    ```

3.  **Backend Setup:**
    It is recommended to use a virtual environment.
    ```bash
    # Create virtual environment
    python -m venv .venv
    
    # Activate it (Windows)
    .\.venv\Scripts\Activate
    
    # Activate it (Mac/Linux)
    source .venv/bin/activate
    
    # Install dependencies
    pip install -r api/requirements.txt
    ```

## Running the Application

You need to run both the frontend and backend servers.

1.  **Start the Backend API:**
    ```bash
    # From the root directory (make sure venv is activated)
    python api/main.py
    ```
    The API will start at `http://localhost:8000`.

2.  **Start the Frontend:**
    Open a new terminal.
    ```bash
    npm run dev
    ```
    The app will run at `http://localhost:5173`.

## Usage

-   **Add US Stocks**: Click "Add Asset", search for a symbol (e.g., "NVDA"), and enter your quantity/cost.
-   **Add Cash**: Add a "USD Wallet" or "THB Wallet" with your starting balance.
-   **Buy Assets**: When adding an investment, select a "Pay With" wallet to deduct the cost seamlessly.

## License

MIT
