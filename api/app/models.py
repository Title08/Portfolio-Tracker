from pydantic import BaseModel
from typing import List, Optional

class PortfolioItem(BaseModel):
    symbol: str
    name: str
    quantity: float
    avgPrice: float
    currentPrice: float
    value: float
    sector: Optional[str] = "Unknown"
    industry: Optional[str] = "Unknown"

class PortfolioAnalysisRequest(BaseModel):
    portfolio: List[PortfolioItem]
    mode: Optional[str] = "The Balanced"
