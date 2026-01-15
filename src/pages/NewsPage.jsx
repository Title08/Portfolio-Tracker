import { useEffect, useState, useRef } from 'react';
import { Newspaper, ExternalLink, ArrowLeft, Layout, Sparkles, FileText, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewsAnalysisModal from '../components/modals/NewsAnalysisModal';
import TickerTag from '../components/common/TickerTag';
import EconomicCalendar from '../components/news/EconomicCalendar';
import { fetchNews, analyzeNews, analyzeArticle } from '../services/api';

/**
 * News Page Component
 * Fetches and displays financial news from the backend
 */
const NewsPage = ({ aiLanguage = 'en', aiModel = 'qwen/qwen3-32b' }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('general');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // AI Analysis State
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [aiError, setAiError] = useState(null);

    const handleAnalyze = async () => {
        setAiLoading(true);
        setAiError(null);
        setAiAnalysis(null);

        try {
            const payload = {
                news: news.map(item => ({
                    title: item.title,
                    publisher: item.publisher || "Unknown",
                    link: item.link
                })),
                language: aiLanguage,
                model: aiModel
            };

            const data = await analyzeNews(payload);
            setAiAnalysis(data.analysis);
        } catch (err) {
            console.error("AI Error:", err);
            setAiError(err.message);
        } finally {
            setAiLoading(false);
        }
    };

    const handleAnalyzeArticle = async (article) => {
        setIsAIModalOpen(true);
        setAiLoading(true);
        setAiError(null);
        setAiAnalysis(null);

        try {
            const payload = {
                article: {
                    title: article.title,
                    publisher: article.publisher || "Unknown",
                    link: article.link,
                    summary: article.summary
                },
                language: aiLanguage,
                model: aiModel
            };

            const data = await analyzeArticle(payload);
            setAiAnalysis(data.analysis);
        } catch (err) {
            console.error("AI Error:", err);
            setAiError(err.message);
        } finally {
            setAiLoading(false);
        }
    };

    // Ref for the scrollable main container
    const mainScrollRef = useRef(null);

    // Categories Configuration
    const CATEGORIES = [
        { id: 'general', label: 'Market Feed', icon: Newspaper },
        { id: 'tech', label: 'Tech & AI', icon: Layout },
        { id: 'finance', label: 'Finance', icon: Newspaper },
        { id: 'crypto', label: 'Crypto', icon: Layout },
    ];

    const fetchNewsData = async (category, pageNum, append = false, query = '') => {
        try {
            if (!append) setLoading(true);
            else setLoadingMore(true);

            // Use search query if active, otherwise category
            const symbol = query.trim() ? query.trim() : null;

            const data = await fetchNews(category, pageNum, symbol);

            if (data.length === 0) {
                setHasMore(false);
            } else {
                setHasMore(true);
                setNews(prev => {
                    if (append) {
                        const existingIds = new Set(prev.map(n => n.id || n.title));
                        const newItems = data.filter(n => !existingIds.has(n.id || n.title));
                        return [...prev, ...newItems];
                    }
                    return data;
                });
            }
        } catch (err) {
            console.error("Error fetching news:", err);
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (mainScrollRef.current) {
            mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setPage(0);
        setHasMore(true);
        // If searching, ignore category change for initial load or handle accordingly
        // Here: Category click clears search
        if (!isSearching) {
            fetchNewsData(activeCategory, 0, false);
        }
    }, [activeCategory]);

    // Handle Search Submit
    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setPage(0);
        setHasMore(true);
        fetchNewsData(activeCategory, 0, false, searchQuery);
    };

    // Clear Search
    const clearSearch = () => {
        setSearchQuery('');
        setIsSearching(false);
        setPage(0);
        setHasMore(true);
        fetchNewsData(activeCategory, 0, false);
    };

    const handleCategoryClick = (catId) => {
        if (isSearching) {
            setSearchQuery('');
            setIsSearching(false);
        }
        setActiveCategory(catId);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNewsData(activeCategory, nextPage, true, isSearching ? searchQuery : null);
    };

    // Infinite Scroll Listener (attached to main container)
    useEffect(() => {
        const handleScroll = () => {
            const container = mainScrollRef.current;
            if (!container) return;

            // Check if scrolled near bottom
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - 200) {
                if (!loading && !loadingMore && hasMore) {
                    handleLoadMore();
                }
            }
        };

        const container = mainScrollRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, loadingMore, hasMore, page, activeCategory]); // handleLoadMore excluded intentionally


    // Format date helper (Fixed)
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        try {
            // Check if timestamp is a number (Unix seconds) or string (ISO)
            const date = typeof timestamp === 'number'
                ? new Date(timestamp * 1000)
                : new Date(timestamp);

            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex justify-center overflow-hidden transition-colors duration-300">
            <div className="w-full max-w-[1920px] flex h-full">

                {/* --- Left Sidebar (Navigation) --- */}
                <aside className="hidden md:flex w-[360px] flex-col h-full border-r border-slate-200 dark:border-slate-800/50 shrink-0 relative bg-white dark:bg-slate-900 z-20 transition-colors">
                    {/* Fixed Header: Back Button */}
                    <div className="p-6 pb-2 shrink-0 bg-white dark:bg-slate-900 transition-colors">
                        <Link to="/" className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                            <ArrowLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span>Back to Portfolio</span>
                        </Link>
                    </div>

                    {/* Scrollable Navigation */}
                    <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
                        <nav className="space-y-2">
                            {CATEGORIES.map((cat) => (
                                <div
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${activeCategory === cat.id
                                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10'
                                        : 'bg-slate-100 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <div className={`p-2 rounded-full ${activeCategory === cat.id ? 'bg-indigo-500/20' : 'bg-slate-200 dark:bg-slate-700/30'}`}>
                                        <cat.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`font-semibold text-base ${activeCategory === cat.id ? 'text-indigo-700 dark:text-indigo-300' : ''}`}>{cat.label}</span>
                                </div>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-auto px-6 py-6 text-xs text-slate-500 shrink-0">
                        <p>Powered by Yahoo Finance</p>
                        <p>&copy; 2026 Portfolio Tracker</p>
                    </div>
                </aside>


                {/* --- Center Column (News Feed) --- */}
                <main
                    ref={mainScrollRef}
                    className="flex-1 h-full overflow-y-auto scrollbar-hide relative"
                >
                    <div className="max-w-[700px] mx-auto p-4 md:px-8 md:pt-8 md:pb-4">
                        <div className="mb-6 flex justify-between items-end">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                    {isSearching ? `Search: "${searchQuery}"` : (CATEGORIES.find(c => c.id === activeCategory)?.label || 'Market')} News
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Real-time updates from global sources</p>
                            </div>

                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="flex-1 max-w-sm mx-4 relative hidden md:block">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Search ticker (e.g. AAPL)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-slate-200 pl-10 pr-10 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                                    />
                                    <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </form>
                            <button
                                onClick={() => { setIsAIModalOpen(true); handleAnalyze(); }}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span className="hidden sm:inline">Summarize with AI</span>
                            </button>
                        </div>


                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse bg-slate-200 dark:bg-slate-800/50 rounded-2xl h-64 w-full"></div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-red-500 dark:text-red-400">
                                <p className="font-medium">Unavailable to load news</p>
                                <p className="text-sm opacity-80 mt-1">{error}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {news.map((item) => (
                                    <article key={item.uuid || item.id} className="bg-white dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all group shadow-sm dark:shadow-none">
                                        {/* Image Section */}
                                        {item.thumbnail && item.thumbnail.resolutions && (
                                            <div className="w-full h-[300px] overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
                                                <img
                                                    src={item.thumbnail.resolutions[item.thumbnail.resolutions.length - 1].url}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}

                                        <div className="p-5">
                                            <div className="flex items-center gap-2 mb-3 text-xs text-slate-500 dark:text-slate-400">
                                                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded border border-indigo-500/20">
                                                    {item.type || 'News'}
                                                </span>
                                                <span>•</span>
                                                <span>{formatDate(item.providerPublishTime)}</span>
                                                {item.publisher && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="font-medium text-slate-700 dark:text-slate-300">{item.publisher}</span>
                                                    </>
                                                )}
                                            </div>

                                            <a
                                                href={item.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                                            >
                                                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                                    {item.title}
                                                </h2>
                                            </a>

                                            {/* Related Tickers */}
                                            {item.relatedTickers && item.relatedTickers.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    {item.relatedTickers.slice(0, 5).map((ticker) => (
                                                        <TickerTag key={ticker} symbol={ticker} />
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 mt-3">
                                                <a
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors"
                                                >
                                                    Read full story <ExternalLink className="w-3 h-3" />
                                                </a>
                                                <button
                                                    onClick={() => handleAnalyzeArticle(item)}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors"
                                                >
                                                    <FileText className="w-3 h-3" /> Summarize
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}

                                {loadingMore && (
                                    <div className="py-4 flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                    </div>
                                )}

                                {!hasMore && news.length > 0 && (
                                    <div className="text-center pt-2 pb-6 text-slate-500 text-sm opacity-60">
                                        End of feed
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>


                <aside className="hidden xl:block w-[360px] p-4 h-full shrink-0 overflow-y-auto">
                    <EconomicCalendar />
                </aside>

            </div>

            <NewsAnalysisModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                loading={aiLoading}
                analysis={aiAnalysis}
                error={aiError}
                onAnalyze={handleAnalyze}
            />
        </div>
    );
}

export default NewsPage;
