from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .routers import assets, analysis

app = FastAPI(title="Portfolio Tracker API", description="API for fetching real-time financial data using yfinance.")

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"INTERNAL ERROR: {exc}") 
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error. Please contact support."}
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Portfolio Tracker API is running"}

# Include Routers
app.include_router(assets.router)
app.include_router(analysis.router)
