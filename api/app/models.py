"""
Pydantic models for API request/response validation.

This module defines the data models used for:
- Portfolio analysis requests
- News analysis requests  
- Chat conversation requests
"""

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
    language: Optional[str] = "en"
    model: Optional[str] = "qwen/qwen3-32b"

class NewsItem(BaseModel):
    title: str
    publisher: Optional[str] = "Unknown"
    link: Optional[str] = None
    summary: Optional[str] = None

class NewsAnalysisRequest(BaseModel):
    news: List[NewsItem]
    language: Optional[str] = "en"
    model: Optional[str] = "qwen/qwen3-32b"

class ArticleAnalysisRequest(BaseModel):
    article: NewsItem
    language: Optional[str] = "en"
    model: Optional[str] = "qwen/qwen3-32b"

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    model: Optional[str] = "qwen/qwen3-32b"
    language: Optional[str] = "en"
