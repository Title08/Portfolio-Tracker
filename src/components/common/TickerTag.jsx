import { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getMiniChart } from '../../services/api';

/**
 * Sparkline component - renders a simple SVG line chart
 */
const Sparkline = ({ data, width = 80, height = 24 }) => {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    const isUp = data[data.length - 1] >= data[0];
    const color = isUp ? '#10b981' : '#ef4444';

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

/**
 * TickerTag component - displays a stock ticker badge with hover tooltip
 */
const TickerTag = ({ symbol }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleMouseEnter = async () => {
        setIsHovered(true);
        if (!data && !loading) {
            setLoading(true);
            const result = await getMiniChart(symbol);
            setData(result);
            setLoading(false);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const isPositive = data?.changePercent >= 0;

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Ticker Badge */}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 cursor-pointer hover:bg-purple-500/30 transition-colors">
                ${symbol}
            </span>

            {/* Tooltip */}
            {isHovered && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-3 animate-in fade-in zoom-in-95 duration-150">
                    {loading ? (
                        <div className="flex items-center justify-center py-2">
                            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : data ? (
                        <div className="space-y-2">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white">{data.symbol}</span>
                                <span className={`flex items-center gap-0.5 text-[10px] font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {isPositive ? '+' : ''}{data.changePercent}%
                                </span>
                            </div>

                            {/* Price */}
                            <div className="text-lg font-bold text-white">
                                ${data.price.toLocaleString()}
                            </div>

                            {/* Sparkline */}
                            {data.sparkline && (
                                <div className="pt-1 border-t border-slate-700">
                                    <Sparkline data={data.sparkline} width={130} height={28} />
                                    <div className="text-[9px] text-slate-500 mt-1">5-day trend</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-xs text-slate-400 text-center py-2">
                            No data available
                        </div>
                    )}

                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                        <div className="w-2 h-2 bg-slate-800 border-r border-b border-slate-700 rotate-45" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TickerTag;
