import React, { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, ArrowLeft, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * News Page Component
 * 
 * Displays market news in a 3-column "Facebook-style" layout.
 * - Left: Vertical Navigation
 * - Center: News Feed
 * - Right: Empty (Reserved)
 */
export default function NewsPage() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('general');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Ref for the scrollable main container
    const mainScrollRef = React.useRef(null);

    // Categories Configuration
    const CATEGORIES = [
        { id: 'general', label: 'Market Feed', icon: Newspaper },
        { id: 'tech', label: 'Tech & AI', icon: Layout },
        { id: 'finance', label: 'Finance', icon: Newspaper },
        { id: 'crypto', label: 'Crypto', icon: Layout },
    ];

    const fetchNews = async (category, pageNum, append = false) => {
        try {
            if (!append) setLoading(true);
            else setLoadingMore(true);

            const response = await fetch(`http://localhost:8000/news?category=${category}&page=${pageNum}`);
            if (!response.ok) {
                throw new Error('Failed to fetch news');
            }
            const data = await response.json();

            // If empty, no more data
            if (data.length === 0) {
                setHasMore(false);
            } else {
                setHasMore(true);
                setNews(prev => {
                    if (append) {
                        // Deduplicate logic
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

    // Initial load & Category change
    useEffect(() => {
        // Scroll the main container to top
        if (mainScrollRef.current) {
            mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setPage(0);
        setHasMore(true);
        fetchNews(activeCategory, 0, false);
    }, [activeCategory]);

    // Load More Handler
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNews(activeCategory, nextPage, true);
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
    }, [loading, loadingMore, hasMore, page, activeCategory]);


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
        <div className="h-screen bg-slate-900 text-slate-100 flex justify-center overflow-hidden">
            <div className="w-full max-w-[1920px] flex h-full">

                {/* --- Left Sidebar (Navigation) --- */}
                <aside className="hidden md:flex w-[360px] flex-col h-full border-r border-slate-800/50 shrink-0 relative bg-slate-900 z-20">
                    {/* Fixed Header: Back Button */}
                    <div className="p-6 pb-2 shrink-0 bg-slate-900">
                        <Link to="/" className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                            <ArrowLeft className="w-5 h-5 text-indigo-400" />
                            <span>Back to Portfolio</span>
                        </Link>
                    </div>

                    {/* Scrollable Navigation */}
                    <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
                        <nav className="space-y-2">
                            {CATEGORIES.map((cat) => (
                                <div
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${activeCategory === cat.id
                                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10'
                                        : 'bg-slate-800/20 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                        }`}
                                >
                                    <div className={`p-2 rounded-full ${activeCategory === cat.id ? 'bg-indigo-500/20' : 'bg-slate-700/30'}`}>
                                        <cat.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`font-semibold text-base ${activeCategory === cat.id ? 'text-indigo-300' : ''}`}>{cat.label}</span>
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
                        <div className="mb-6">
                            <h1 className="text-xl font-bold text-white mb-1">
                                {CATEGORIES.find(c => c.id === activeCategory)?.label || 'Market'} News
                            </h1>
                            <p className="text-sm text-slate-400">Real-time updates from global sources</p>
                        </div>


                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse bg-slate-800/50 rounded-2xl h-64 w-full"></div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-red-400">
                                <p className="font-medium">Unavailable to load news</p>
                                <p className="text-sm opacity-80 mt-1">{error}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {news.map((item) => (
                                    <article key={item.uuid || item.id} className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:bg-slate-800/60 transition-all group">
                                        {/* Image Section */}
                                        {item.thumbnail && item.thumbnail.resolutions && (
                                            <div className="w-full h-[300px] overflow-hidden bg-slate-900 relative">
                                                <img
                                                    src={item.thumbnail.resolutions[item.thumbnail.resolutions.length - 1].url}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}

                                        <div className="p-5">
                                            <div className="flex items-center gap-2 mb-3 text-xs text-slate-400">
                                                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">
                                                    {item.type || 'News'}
                                                </span>
                                                <span>•</span>
                                                <span>{formatDate(item.providerPublishTime)}</span>
                                                {item.publisher && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="font-medium text-slate-300">{item.publisher}</span>
                                                    </>
                                                )}
                                            </div>

                                            <h2 className="text-base font-bold text-white mb-2 leading-tight group-hover:text-indigo-400 transition-colors">
                                                {item.title}
                                            </h2>

                                            <a
                                                href={item.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 mt-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                                            >
                                                Read full story <ExternalLink className="w-4 h-4" />
                                            </a>
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


                {/* --- Right Sidebar (Empty/Future) --- */}
                <aside className="hidden xl:block w-[360px] p-4 h-full shrink-0">
                    {/* Empty for now as requested */}
                </aside>

            </div>
        </div>
    );
}
