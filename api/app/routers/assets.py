from fastapi import APIRouter
from typing import List
from ..services import finance, ai
from ..models import NewsAnalysisRequest, ArticleAnalysisRequest

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
def get_market_news(category: str = "general", page: int = 0):
    return finance.get_market_news(category, page)

@router.post("/news/analyze")
def analyze_news(request: NewsAnalysisRequest):
    return ai.analyze_market_news(request)

@router.post("/news/analyze/article")
def analyze_article(request: ArticleAnalysisRequest):
    return ai.analyze_article(request)
