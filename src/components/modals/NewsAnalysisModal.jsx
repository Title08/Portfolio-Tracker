
import { X, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const NewsAnalysisModal = ({ isOpen, onClose, loading, analysis, error, onAnalyze }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e1e1e] rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-emerald-900/20 to-blue-900/20 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg shadow-lg shadow-emerald-500/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">AI Market Pulse</h2>
                            <p className="text-xs text-gray-400">Real-time news summary via Groq</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 text-gray-300 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                            <p className="text-lg font-medium text-emerald-300 animate-pulse">
                                Reading the latest headlines...
                            </p>
                            <p className="text-sm text-gray-500">
                                Synthesizing market sentiment and key topics.
                            </p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-400 mb-1">Analysis Failed</h3>
                                <p className="text-red-200/80">{error}</p>
                                <button
                                    onClick={onAnalyze}
                                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : analysis ? (
                        <div className="prose prose-invert prose-emerald max-w-none">
                            <style>{`
                                .prose h3 { color: #34d399; margin-top: 1.5em; margin-bottom: 0.5em; font-size: 1.1em; }
                                .prose p { margin-bottom: 1em; line-height: 1.6; color: #e2e8f0; }
                                .prose ul { margin-top: 0.5em; margin-bottom: 0.5em; }
                                .prose li { margin-bottom: 0.25em; color: #cbd5e1; }
                                .prose strong { color: #f8fafc; font-weight: 600; }
                            `}</style>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {analysis}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            <p>Ready to analyze the current news feed.</p>
                            <button
                                onClick={onAnalyze}
                                className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                            >
                                Start Analysis
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 flex justify-end bg-[#1e1e1e] rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsAnalysisModal;
