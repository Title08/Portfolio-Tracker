from groq import Groq
from fastapi import HTTPException
import re
from ..models import PortfolioAnalysisRequest, NewsAnalysisRequest, ArticleAnalysisRequest

import os

# Configure Groq API
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

def analyze_market_news(request: NewsAnalysisRequest):
    news_text = ""
    for item in request.news[:20]: # Limit to top 20 to avoid token limits
        news_text += f"- {item.title} (Source: {item.publisher})\n"

    prompt = (
        "Analyze the following recent market news headlines and provide a brief, engaging market pulse report:\n\n"
        f"{news_text}\n\n"
        "Please provide a structured summary in Markdown format using the following structure:\n\n"
        "### 🚦 Market Sentiment\n"
        "**[Bullish/Bearish/Neutral]** - One sentence explanation.\n\n"
        "### 🔥 Key Themes\n"
        "- **[Topic 1]**: Brief detail.\n"
        "- **[Topic 2]**: Brief detail.\n"
        "- **[Topic 3]**: Brief detail.\n\n"
        "### 📝 Executive Summary\n"
        "A concise 3-4 sentence paragraph summarizing the overall market situation for an investor.\n\n"
        "**Style Guidelines:**\n"
        "- Use relevant emojis for each section and theme (e.g., 📈, 📉, 🤖, 🏦).\n"
        "- Make it punchy and easy to read."
    )

    system_instruction = "You are a professional financial news analyst. You provide concise, high-level market summaries based on news headlines."
    if request.language == 'th':
        system_instruction += " IMPORTANT: You MUST output the entire response in Thai Language (ภาษาไทย). Translating technical terms is optional but the main content must be Thai."

    try:
        completion = client.chat.completions.create(
            model=request.model or "qwen/qwen3-32b",
            messages=[
                {
                    "role": "system",
                    "content": system_instruction
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.6,
            max_tokens=1024,
            top_p=1,
            stream=False,
        )
        
        content = completion.choices[0].message.content
        clean_content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()
        return {"analysis": clean_content}
        
    except Exception as e:
        print(f"News Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=f"Groq API Error: {str(e)}")

def analyze_article(request: ArticleAnalysisRequest):
    item = request.article
    base_text = f"Title: {item.title}\nPublisher: {item.publisher}\n"
    if item.summary:
        base_text += f"Summary Context: {item.summary}\n"

    prompt = (
        "Analyze this specific news article and provide a concise summary:\n\n"
        f"{base_text}\n\n"
        "Please output the response in the following Markdown format:\n\n"
        "### 📌 Key Takeaways\n"
        "- **Point 1**: [Detail]\n"
        "- **Point 2**: [Detail]\n"
        "- **Point 3**: [Detail]\n\n"
        "### 💡 Why it matters\n"
        "One sentence explaining the impact on investors.\n\n"
        "**Style**: Use emojis, be brief, and make it look premium."
    )

    system_instruction = "You are a concise financial news summarizer."
    if request.language == 'th':
        system_instruction += " IMPORTANT: You MUST output the entire response in Thai Language (ภาษาไทย)."

    try:
        completion = client.chat.completions.create(
            model=request.model or "qwen/qwen3-32b",
            messages=[
                {
                    "role": "system",
                    "content": system_instruction
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.6,
            max_tokens=512,
            top_p=1,
            stream=False,
        )
        content = completion.choices[0].message.content
        clean_content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()
        return {"analysis": clean_content}
    except Exception as e:
        print(f"Article Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=f"Groq API Error: {str(e)}")

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
        "6. **Rebalancing Analysis**: Suggestions for buying/selling to optimize the portfolio.\n"
        "7. **💡 Actionable Suggestions**: Provide 3-5 specific, actionable recommendations with:\n"
        "   - Specific stock tickers to BUY, SELL, or HOLD\n"
        "   - Suggested allocation percentages\n"
        "   - Priority level (High/Medium/Low)\n\n"
        "IMPORTANT FORMATTING INSTRUCTIONS:\n"
        "- Use Markdown tables for any structured data (e.g., 'Category | Current Allocation | Recommended Allocation').\n"
        "- Do NOT use simple lists for data comparison. ALWAYS use tables.\n"
        "- Format the response in clear Markdown."
    )

    system_instruction = "You are an expert financial advisor using Warren Buffett and Ray Dalio principles. You strictly outputs Markdown tables for data comparisons."
    if request.language == 'th':
        system_instruction += " IMPORTANT: You MUST output the entire response in Thai Language (ภาษาไทย). Translating technical terms is optional but the main content must be Thai."

    try:
        completion = client.chat.completions.create(
            model=request.model or "qwen/qwen3-32b",
            messages=[
                {
                    "role": "system",
                    "content": system_instruction
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

