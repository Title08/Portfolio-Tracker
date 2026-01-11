from fastapi import APIRouter
from typing import List
from ..services import finance

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
