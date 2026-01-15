import { useState, useEffect } from 'react';
import { X, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyzePortfolio as analyzePortfolioAPI } from '../../services/api';

const AIAnalysisModal = ({ isOpen, onClose, portfolio, aiLanguage = 'en', aiModel = 'qwen/qwen3-32b' }) => {
    const [selectedMode, setSelectedMode] = useState('The Balanced');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setAnalysis(null);
            setError(null);
        }
    }, [isOpen]);

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const payload = {
                portfolio: portfolio.map(asset => ({
                    symbol: asset.symbol || "Unknown",
                    name: asset.name || "Unknown",
                    quantity: parseFloat(asset.quantity) || 0,
                    avgPrice: parseFloat(asset.avgPrice) || 0,
                    currentPrice: parseFloat(asset.price || asset.currentPrice || 0) || 0,
                    value: parseFloat(asset.value || (asset.quantity * (asset.price || 0))) || 0,
                    sector: asset.sector || "Unknown",
                    industry: asset.industry || "Unknown"
                })),
                mode: selectedMode,
                language: aiLanguage,
                model: aiModel
            };

            const data = await analyzePortfolioAPI(payload);
            setAnalysis(data.analysis);
        } catch (err) {
            console.error(err);
            setError(err.message === 'Failed to fetch'
                ? 'Cannot connect to server. Is the backend running?'
                : err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-slate-200 dark:border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl transition-colors">

                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-100 dark:bg-slate-800 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg shadow-purple-500/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">AI Portfolio Analysis</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Groq ({aiModel.split('/').pop()})</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 text-slate-700 dark:text-gray-300 custom-scrollbar bg-white dark:bg-transparent">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="w-12 h-12 text-purple-600 dark:text-purple-500 animate-spin" />
                            <p className="text-lg font-medium text-purple-600 dark:text-purple-300 animate-pulse">
                                Analyzing your portfolio...
                            </p>
                            <p className="text-sm text-slate-500 dark:text-gray-500">
                                Evaluating risk, performance, and diversification.
                            </p>
                        </div>
                    ) : !analysis && !error ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-6">
                            <div className="w-full max-w-md space-y-3">
                                <label className="text-sm font-medium text-slate-600 dark:text-gray-400">Select Investment Strategy</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {['The Defensive', 'The Income Portfolio', 'The Balanced', 'The Growth Portfolio', 'The Aggressive Growth Portfolio'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setSelectedMode(mode)}
                                            className={`p-3 rounded-lg border text-left transition-all ${selectedMode === mode
                                                ? 'bg-purple-100 dark:bg-purple-500/30 border-purple-500 text-purple-900 dark:text-white shadow-sm dark:shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={handleAnalyze}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 transition-all transform hover:scale-105"
                            >
                                Start Analysis
                            </button>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-6 flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-700 dark:text-red-400 mb-1">Analysis Failed</h3>
                                <p className="text-red-600/80 dark:text-red-200/80">{error}</p>
                                {error.includes("Ollama") && (
                                    <div className="mt-3 text-xs bg-black/10 dark:bg-black/30 p-3 rounded border border-red-500/20 font-mono text-slate-600 dark:text-gray-400">
                                        Tip: Check your internet connection.
                                    </div>
                                )}
                                <button
                                    onClick={handleAnalyze}
                                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : analysis ? (
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {analysis}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-400 dark:text-gray-500">
                            <p>No data available to analyze.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-white/10 flex justify-end bg-gray-50 dark:bg-[#1e1e1e] rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-none hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-white rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIAnalysisModal;
