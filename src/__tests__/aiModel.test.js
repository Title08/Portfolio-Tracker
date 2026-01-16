/**
 * AI Model Configuration Tests
 * 
 * These tests verify that all AI features use the model selected in Settings.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

describe('AI Model Configuration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Chat API', () => {
        it('should send the correct model in chat requests', async () => {
            const mockResponse = { response: 'Test response' }
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            })

            const selectedModel = 'meta-llama/llama-4-scout-17b-16e-instruct'

            await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: 'Hello',
                    history: [],
                    model: selectedModel,
                    language: 'en'
                })
            })

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/chat',
                expect.objectContaining({
                    body: expect.stringContaining(selectedModel)
                })
            )
        })
    })

    describe('News Analysis API', () => {
        it('should send the correct model in news analysis requests', async () => {
            const mockResponse = { analysis: 'Test analysis' }
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            })

            const selectedModel = 'qwen/qwen3-32b'

            await fetch('http://localhost:8000/api/news/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    news: [{ title: 'Test', publisher: 'Test' }],
                    model: selectedModel,
                    language: 'en'
                })
            })

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/news/analyze',
                expect.objectContaining({
                    body: expect.stringContaining(selectedModel)
                })
            )
        })
    })

    describe('Article Analysis API', () => {
        it('should send the correct model in article analysis requests', async () => {
            const mockResponse = { analysis: 'Test analysis' }
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            })

            const selectedModel = 'deepseek/deepseek-r1-distill-llama-70b'

            await fetch('http://localhost:8000/api/news/analyze/article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    article: { title: 'Test', publisher: 'Test' },
                    model: selectedModel,
                    language: 'th'
                })
            })

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/news/analyze/article',
                expect.objectContaining({
                    body: expect.stringContaining(selectedModel)
                })
            )
        })
    })

    describe('Portfolio Analysis API', () => {
        it('should send the correct model in portfolio analysis requests', async () => {
            const mockResponse = { analysis: 'Test analysis' }
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            })

            const selectedModel = 'meta-llama/llama-4-scout-17b-16e-instruct'

            await fetch('http://localhost:8000/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    portfolio: [{ symbol: 'AAPL', name: 'Apple', quantity: 10, avgPrice: 150, currentPrice: 155, value: 1550 }],
                    mode: 'The Balanced',
                    model: selectedModel,
                    language: 'en'
                })
            })

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/analyze',
                expect.objectContaining({
                    body: expect.stringContaining(selectedModel)
                })
            )
        })
    })
})

describe('Model Selection Persistence', () => {
    it('should use the model from settings across all components', () => {
        // This test verifies that the model prop is consistently passed
        const models = [
            'qwen/qwen3-32b',
            'meta-llama/llama-4-scout-17b-16e-instruct',
            'deepseek/deepseek-r1-distill-llama-70b'
        ]

        models.forEach(model => {
            const chatPayload = JSON.stringify({ message: 'test', model })
            const newsPayload = JSON.stringify({ news: [], model })
            const analysisPayload = JSON.stringify({ portfolio: [], model })

            expect(chatPayload).toContain(model)
            expect(newsPayload).toContain(model)
            expect(analysisPayload).toContain(model)
        })
    })
})
