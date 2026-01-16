/**
 * ChatPage Component
 * 
 * A real-time AI chat interface for investment and financial planning advice.
 * Features:
 * - Message history with localStorage persistence
 * - Markdown rendering for AI responses
 * - Auto-scroll to latest messages
 * - Configurable AI model selection from Settings
 * 
 * @module pages/ChatPage
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const CHAT_HISTORY_KEY = 'chatHistory_v1';
const MAX_HISTORY_CONTEXT = 10; // Number of past messages to send for context

// --- Suggested Questions ---
const SUGGESTED_QUESTIONS = [
    'What stocks should I buy?',
    'Explain diversification',
    'How to start investing?',
    'Analyze AAPL stock'
];

/**
 * ChatPage - AI-powered financial assistant chat interface
 * 
 * @param {Object} props
 * @param {string} props.aiModel - AI model identifier from settings
 * @param {string} props.aiLanguage - Response language preference ('en' | 'th')
 */
export default function ChatPage({ aiModel = 'qwen/qwen3-32b', aiLanguage = 'en' }) {
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem(CHAT_HISTORY_KEY);
        return saved ? JSON.parse(saved) : [];
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // --- Effects ---

    // Persist messages to localStorage
    useEffect(() => {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }, [messages]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- Handlers ---

    /**
     * Send a message to the AI assistant
     */
    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    history: messages.slice(-MAX_HISTORY_CONTEXT).map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    model: aiModel,
                    language: aiLanguage
                })
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();

            const assistantMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: data.response,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please make sure the backend server is running.',
                timestamp: new Date().toISOString(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearHistory = () => {
        setMessages([]);
        localStorage.removeItem('chatHistory_v1');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Link
                        to="/"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                            <Bot size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-800 dark:text-white">AI Assistant</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Powered by {aiModel.split('/').pop()}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={clearHistory}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                    title="Clear chat history"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full mb-4">
                            <Sparkles size={48} className="text-purple-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
                            Start a Conversation
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md">
                            Ask me anything about investments, market analysis, or financial planning!
                        </p>
                        <div className="mt-6 flex flex-wrap gap-2 justify-center">
                            {SUGGESTED_QUESTIONS.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => setInput(suggestion)}
                                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                                    <Bot size={16} className="text-white" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                    ? 'bg-emerald-500 text-white'
                                    : message.isError
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {message.role === 'assistant' ? (
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                )}
                                <p className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-emerald-200' : 'text-slate-400'
                                    }`}>
                                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            {message.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                    <User size={16} className="text-white" />
                                </div>
                            )}
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <Bot size={16} className="text-white" />
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-sm">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
                <div className="max-w-4xl mx-auto flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        rows={1}
                        className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </div>
                <p className="text-center text-xs text-slate-400 mt-2">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
