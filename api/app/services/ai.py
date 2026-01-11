from groq import Groq
from fastapi import HTTPException
import re
from ..models import PortfolioAnalysisRequest

import os

# Configure Groq API
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

def analyze_portfolio(request: PortfolioAnalysisRequest):
    portfolio_summary = ""
    total_value = 0
    
    for item in request.portfolio:
        total_value += item.value
        portfolio_summary += (
            f"- {item.symbol} ({item.name}): {item.quantity} shares @ ${item.currentPrice:.2f} "
            f"(Total: ${item.value:.2f}). Sector: {item.sector}, Industry: {item.industry}\n"
        )
    
    strategies = {
        "The Defensive": "Prioritize capital preservation and low volatility. Criticize high-risk speculative assets. Favor blue chips, bonds, and consumer staples.",
        "The Income Portfolio": "Focus on maximizing stable cash flow via dividends and REITs. Criticize low-yield growth stocks.",
        "The Balanced": "Seek a mix of growth and stability. Ensure moderate risk exposure with decent potential returns.",
        "The Growth Portfolio": "Prioritize capital appreciation. Tolerate higher volatility for higher returns. Favor tech and expanding sectors.",
        "The Aggressive Growth Portfolio": "Maximize potential returns with high risk tolerance. Look for moonshots and high-beta assets. Criticize overly safe/low-return allocations."
    }
    
    strategy_instruction = strategies.get(request.mode, strategies["The Balanced"])

    prompt = (
        f"Analyze this investment portfolio (Total Value: ${total_value:.2f}) based on the '{request.mode}' strategy:\n"
        f"Strategy Goal: {strategy_instruction}\n\n"
        f"{portfolio_summary}\n\n"
        "Please provide a comprehensive financial analysis covering the following aspects:\n"
        "1. **Diversification & Risk Assessment**: Assess sector/industry concentration and overall risk.\n"
        "2. **Performance Measurement**: Evaluate potential return drivers and risks.\n"
        "3. **Correlation Analysis**: Identify if assets are highly correlated (e.g., all tech).\n"
        "4. **Attribution Analysis**: What is driving the value? (Sector allocation vs Stock selection)\n"
        "5. **Stress Testing & Scenario Analysis**: How might this portfolio perform in a market crash or high-interest rate environment?\n"
        "6. **Rebalancing Analysis**: Suggestions for buying/selling to optimize the portfolio.\n\n"
        "IMPORTANT FORMATTING INSTRUCTIONS:\n"
        "- Use Markdown tables for any structured data (e.g., 'Category | Current Allocation | Recommended Allocation').\n"
        "- Do NOT use simple lists for data comparison. ALWAYS use tables.\n"
        "- Format the response in clear Markdown."
    )

    try:
        completion = client.chat.completions.create(
            model="qwen/qwen3-32b",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert financial advisor using Warren Buffett and Ray Dalio principles. You strictly outputs Markdown tables for data comparisons."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=4096,
            top_p=1,
            stream=False,
            stop=None,
        )
        
        content = completion.choices[0].message.content
        clean_content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()
        return {"analysis": clean_content}
        
    except Exception as e:
        print(f"AI Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=f"Groq API Error: {str(e)}")
