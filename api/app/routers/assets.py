"""
Assets Router

API endpoints for financial data and AI services:
- Asset search and info
- Market news and analysis
- AI chat and portfolio analysis
- Economic calendar
"""

from fastapi import APIRouter

from ..services import finance, ai
from ..models import NewsAnalysisRequest, ArticleAnalysisRequest, ChatRequest

router = APIRouter()

@router.get("/search")
def search_assets(q: str):
    return finance.search_assets(q)

@router.get("/info")
def get_asset_info(symbol: str):
    return finance.get_asset_info(symbol)

@router.get("/prices")
def get_current_prices(symbols: str):
    return finance.get_current_prices(symbols)

@router.get("/news")
def get_market_news(category: str = "general", symbol: str = None, page: int = 0):
    return finance.get_market_news(category, symbol, page)

@router.post("/news/analyze")
def analyze_news(request: NewsAnalysisRequest):
    return ai.analyze_market_news(request)

@router.post("/news/analyze/article")
def analyze_article(request: ArticleAnalysisRequest):
    return ai.analyze_article(request)

@router.post("/chat")
def chat(request: ChatRequest):
    """Chat with AI assistant"""
    return ai.chat(request)

@router.get("/mini-chart")
def get_mini_chart(symbol: str):
    """Get mini chart data for ticker tooltip (price, change, sparkline)"""
    result = finance.get_mini_chart(symbol)
    if result is None:
        return {"error": "Could not fetch data", "symbol": symbol}
    return result

@router.get("/economic-calendar")
def get_economic_calendar():
    """Get upcoming economic events"""
    return finance.get_economic_calendar()

