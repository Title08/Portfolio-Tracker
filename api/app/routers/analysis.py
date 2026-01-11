from fastapi import APIRouter
from ..models import PortfolioAnalysisRequest
from ..services import ai

router = APIRouter()

@router.post("/analyze")
def analyze_portfolio(request: PortfolioAnalysisRequest):
    return ai.analyze_portfolio(request)
